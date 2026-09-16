import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Body, 
  UploadedFile, 
  UseInterceptors, 
  InternalServerErrorException, 
  BadRequestException, 
  PayloadTooLargeException,
  NotFoundException,
  UnprocessableEntityException,
  UseGuards,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { TenderEntity } from '@app/database/entities/tender/tender.entity';
import { PipelineItemEntity } from '@app/database/entities/pipeline/pipeline-item.entity';
import { OrganizationEntity } from '@app/database/entities/identity/organization.entity';
import { TenderDocumentEntity } from '@app/database/entities/tender/tender-document.entity';
import { TenderEvaluationEntity } from '@app/database/entities/ai/tender-evaluation.entity';
import { AiGatewayService } from './modules/ai/ai-gateway.service';

import { JwtAuthGuard } from '../../../libs/common/guards/jwt-auth.guard';
import { OrganizationMembershipGuard } from '../../../libs/common/guards/organization-membership.guard';
import { CurrentUser, JwtPayload } from '../../../libs/common/decorators/current-user.decorator';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface EvaluatePayload {
  documentId: string;
  dynamicContext?: string;
}

@UseGuards(JwtAuthGuard, OrganizationMembershipGuard)
@Controller('organizations/:orgId')
export class EvaluationController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly aiGatewayService: AiGatewayService
  ) {}
  
  @Post('tenders/:tenderId/evaluate')
  async evaluateTender(
    @Param('orgId') orgId: string, 
    @Param('tenderId') tenderId: string,
    @Body() payload: EvaluatePayload,
    @CurrentUser() user: JwtPayload
  ) {
    if (!payload.documentId) {
      throw new UnprocessableEntityException('documentId is required for evaluation.');
    }

    const orgRepo = this.dataSource.getRepository(OrganizationEntity);
    const org = await orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException(`Organization with ID ${orgId} not found.`);

    const docRepo = this.dataSource.getRepository(TenderDocumentEntity);
    const doc = await docRepo.findOne({ where: { id: payload.documentId, organizationId: orgId } });
    if (!doc) throw new NotFoundException(`Tender document ${payload.documentId} not found for this organization.`);

    let evaluationResult;

    // 1. Execute P0.9 AI Engine Pipeline
    try {
      const orgCapabilitiesText = payload.dynamicContext || "Core technical competencies in AI, ML, and hardware integration.";
      evaluationResult = await this.aiGatewayService.evaluateTenderMatch(orgId, {
        document_id: doc.id,
        org_profile_text: orgCapabilitiesText
      });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('422') || err.message.includes('DOCUMENT_NOT_PROCESSED') || err.message.includes('Unprocessable')) {
        throw new UnprocessableEntityException('Tender Document has not been fully processed (chunked and embedded) yet.');
      }
      throw new InternalServerErrorException(`AI Engine Evaluation Failed: ${err.message}`);
    }

    // 2. P1.4 Database Persistence (Idempotent Upsert)
    try {
      const evalRepo = this.dataSource.getRepository(TenderEvaluationEntity);
      let evaluation = await evalRepo.findOne({ 
        where: { organizationId: orgId, tenderId: tenderId, documentId: doc.id } 
      });

      if (!evaluation) {
        evaluation = evalRepo.create({
          organizationId: orgId,
          tenderId: tenderId,
          documentId: doc.id,
        });
      }

      evaluation.matchScore = evaluationResult.matchScore;
      evaluation.eligibilityStatus = evaluationResult.eligibilityStatus;
      evaluation.evidenceCoverage = evaluationResult.evidenceCoverage;
      evaluation.summary = evaluationResult.summary;
      evaluation.gaps = evaluationResult.gaps;
      evaluation.recommendations = evaluationResult.recommendations;
      evaluation.ruleResults = evaluationResult.ruleResults as object[];

      await evalRepo.save(evaluation);
      return evaluationResult;

    } catch (error) {
      console.error('Failed to persist evaluation result:', error);
      throw new InternalServerErrorException('Evaluation succeeded, but failed to save the durable record.');
    }
  }

  @Get('tenders/:tenderId/evaluation')
  async getPersistedEvaluation(
    @Param('orgId') orgId: string,
    @Param('tenderId') tenderId: string,
    @Query('documentId') documentId?: string
  ) {
    const evalRepo = this.dataSource.getRepository(TenderEvaluationEntity);
    
    // SECURITY: Implicit Tenant Isolation applied via 'organizationId: orgId'
    const whereClause: { organizationId: string; tenderId: string; documentId?: string } = { 
      organizationId: orgId, 
      tenderId: tenderId 
    };
    
    if (documentId) {
      whereClause.documentId = documentId;
    }

    const evaluation = await evalRepo.findOne({
      where: whereClause,
      order: { updatedAt: 'DESC' }
    });

    if (!evaluation) {
      throw new NotFoundException('No evaluation record found for this tender.');
    }

    // Map back to frontend expected EvaluationResult schema
    return {
      tenderId: evaluation.tenderId,
      organizationId: evaluation.organizationId,
      documentId: evaluation.documentId,
      matchScore: evaluation.matchScore,
      eligibilityStatus: evaluation.eligibilityStatus,
      evidenceCoverage: evaluation.evidenceCoverage,
      summary: evaluation.summary,
      gaps: evaluation.gaps,
      recommendations: evaluation.recommendations,
      ruleResults: evaluation.ruleResults
    };
  }

  @Post('documents/extract')
  @UseInterceptors(FileInterceptor('file'))
  async extractDocument(
    @Param('orgId') orgId: string, 
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: JwtPayload
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Unsupported file type. Only PDF is allowed.');
    if (file.size > 15 * 1024 * 1024) throw new PayloadTooLargeException('File size exceeds the 15MB limit.');

    const docRepo = this.dataSource.getRepository(TenderDocumentEntity);

    // 1. Create document in DB FIRST to reserve UUID and set INITIAL status
    let newDoc = docRepo.create({
      organizationId: orgId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      extractionStatus: 'PROCESSING', // Locks the UI/Eval endpoint
    } as Partial<TenderDocumentEntity>);
    newDoc = await docRepo.save(newDoc);

    try {
      // 2. Transmit to AI Engine for synchronous P1.2 Pipeline (Extract -> Chunk -> Embed -> PGVector)
      const aiResponse = await this.aiGatewayService.extractDocumentText(
          newDoc.id, 
          file.buffer, 
          file.mimetype, 
          file.originalname
      );

      // 3. Mark READY upon successful pgvector completion
      newDoc.extractionStatus = aiResponse.status === 'SUCCESS' ? 'READY' : 'FAILED';
      if (aiResponse.status === 'NO_EXTRACTABLE_TEXT') {
          newDoc.extractionStatus = 'NO_EXTRACTABLE_TEXT';
      }
      
      newDoc.extractedText = (aiResponse.extracted_text as string) || null;
      newDoc.pageCount = (aiResponse.page_count as number) || 0;
      await docRepo.save(newDoc);

      return {
        id: newDoc.id,
        filename: newDoc.fileName,
        status: newDoc.extractionStatus,
        pageCount: newDoc.pageCount,
        extractedText: newDoc.extractedText
      };
    } catch (error) {
      // 4. Safely revert status on internal failure
      newDoc.extractionStatus = 'FAILED';
      await docRepo.save(newDoc);
      throw error;
    }
  }

  @Get('tenders/sync-live')
  async syncLiveTenders(@Param('orgId') orgId: string) {
    try {
      // 1. Fetch normalized data from AI Engine Connector
      const response = await fetch('http://localhost:8000/internal/tenders/live-feed');
      if (!response.ok) {
        throw new Error(`Failed to fetch from Python ingestion engine: ${response.status}`);
      }
      
      const liveItems = await response.json();
      const tenderRepo = this.dataSource.getRepository(TenderEntity);
      
      let inserted = 0;
      let updated = 0;
      let failed = 0;

      // 2. Idempotent Upsert Logic (Deduplication)
      for (const item of liveItems) {
        try {
          if (!item.referenceNumber || !item.title) {
            failed++;
            continue; // Skip invalid normalized payloads
          }

          let existing = await tenderRepo.findOne({ where: { referenceNumber: item.referenceNumber } });
          
          if (existing) {
            // UPSERT: Update existing tender with fresh external data
            tenderRepo.merge(existing, {
              title: item.title,
              issuingAuthority: item.issuingAuthority,
              estimatedValue: item.estimatedValue || existing.estimatedValue,
              description: item.description,
              // Preserving existing internal tracking fields
            });
            await tenderRepo.save(existing);
            updated++;
          } else {
            // INSERT: Create brand new tender
            const newTender = tenderRepo.create({
              referenceNumber: item.referenceNumber,
              title: item.title,
              issuingAuthority: item.issuingAuthority,
              estimatedValue: item.estimatedValue,
              procurementCategory: item.procurementCategory,
              description: item.description,
            } as Partial<TenderEntity>);
            await tenderRepo.save(newTender);
            inserted++;
          }
        } catch (dbErr) {
          console.error(`Failed to upsert tender ${item.referenceNumber}:`, dbErr);
          failed++;
        }
      }

      // 3. Return structured ingestion statistics
      return { 
        success: true, 
        stats: {
          fetched: liveItems.length,
          inserted,
          updated,
          failed
        }
      };
    } catch (error) {
      console.error('Tender Sync Error:', error);
      throw new InternalServerErrorException('Live tender synchronization failed');
    }
  }

  @Post('pipeline/:tenderId')
  async saveToPipeline(
    @Param('orgId') orgId: string,
    @Param('tenderId') tenderId: string,
  ) {
    const pipelineRepo = this.dataSource.getRepository(PipelineItemEntity);
    
    let existing = await pipelineRepo.findOne({ where: { tenderId, organizationId: orgId } });
    if (existing) {
      return existing; 
    }

    const newItem = pipelineRepo.create({
      organizationId: orgId,
      tenderId: tenderId,
      status: 'Drafting',
    } as Partial<PipelineItemEntity>);

    return await pipelineRepo.save(newItem);
  }

  @Get('pipeline')
  async getPipeline(@Param('orgId') orgId: string) {
    const pipelineRepo = this.dataSource.getRepository(PipelineItemEntity);
    const tenderRepo = this.dataSource.getRepository(TenderEntity);
    
    const pipelineItems = await pipelineRepo.find({ where: { organizationId: orgId } });
    
    const enrichedItems = await Promise.all(
      pipelineItems.map(async (item) => {
        const tender = await tenderRepo.findOne({ where: { id: item.tenderId } });
        return {
          ...item,
          tenderTitle: tender?.title || 'Untitled Tender',
          issuingAuthority: tender?.issuingAuthority || 'Government Authority',
          estimatedValue: tender?.estimatedValue || 0,
        };
      })
    );

    return enrichedItems;
  }

  @Delete('pipeline/:id')
  async deleteFromPipeline(@Param('orgId') orgId: string, @Param('id') id: string) {
    const pipelineRepo = this.dataSource.getRepository(PipelineItemEntity);
    
    // IDOR Protection: Ensure the pipeline item belongs to the requested organization
    const item = await pipelineRepo.findOne({ where: { id, organizationId: orgId } });
    if (!item) {
      throw new NotFoundException('Pipeline item not found for this organization.');
    }

    await pipelineRepo.delete(id);
    return { success: true };
  }
}