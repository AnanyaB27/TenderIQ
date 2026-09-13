import { Controller, Post, Get, Delete, Param, Body, UploadedFile, UseInterceptors, InternalServerErrorException, BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { TenderEntity } from '@app/database/entities/tender/tender.entity';
import { PipelineItemEntity } from '@app/database/entities/pipeline/pipeline-item.entity';
import { OrganizationEntity } from '@app/database/entities/identity/organization.entity';
import { TenderDocumentEntity } from '@app/database/entities/tender/tender-document.entity';
import { AiGatewayService } from './modules/ai/ai-gateway.service';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

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
    @Body('dynamicContext') dynamicContext?: string,
  ) {
    const tender = await this.dataSource.getRepository(TenderEntity).findOne({ where: { id: tenderId } });
    
    if (!tender) {
      throw new InternalServerErrorException('Tender not found in database');
    }

    const orgCapabilities = dynamicContext || "Core technical competencies in artificial intelligence, machine learning, and hardware integration. Proven track record deploying AI-driven wildlife detection cameras using Raspberry Pi and Arduino-powered automated laser fencing systems for perimeter security.";

    return this.aiGatewayService.evaluateTenderMatch(orgId, {
      tender_id: tenderId,
      tender_title: tender.title,
      tender_description: tender.description || tender.procurementCategory || 'General Procurement',
      org_capabilities: orgCapabilities,
      dynamic_context: dynamicContext || null,
    });
  }

  @Post('documents/extract')
  @UseInterceptors(FileInterceptor('file'))
  async extractDocument(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Unsupported file type. Only PDF is allowed.');
    }
    
    if (file.size > 15 * 1024 * 1024) {
      throw new PayloadTooLargeException('File size exceeds the 15MB limit.');
    }

    const aiResponse = await this.aiGatewayService.extractDocumentText(file.buffer, file.mimetype, file.originalname);

    const docRepo = this.dataSource.getRepository(TenderDocumentEntity);
    const realOrgId = await this.getRealOrgId();

    const newDoc = docRepo.create({
      organizationId: realOrgId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      pageCount: aiResponse.page_count || 0,
      extractionStatus: aiResponse.status || 'FAILED',
      extractedText: aiResponse.extracted_text || null
    } as Partial<TenderDocumentEntity>);

    const savedDoc = await docRepo.save(newDoc);

    return {
      id: savedDoc.id,
      filename: savedDoc.fileName,
      status: savedDoc.extractionStatus,
      pageCount: savedDoc.pageCount,
      extractedText: savedDoc.extractedText,
      pages: aiResponse.pages
    };
  }

  @Get('tenders/sync-live')
  async syncLiveTenders() {
    try {
      const response = await fetch('http://localhost:8000/internal/tenders/live-feed');
      if (!response.ok) {
        throw new Error('Failed to fetch from Python ingestion engine');
      }
      const liveItems = await response.json();
      const tenderRepo = this.dataSource.getRepository(TenderEntity);

      for (const item of liveItems) {
        let existing = await tenderRepo.findOne({ where: { referenceNumber: item.referenceNumber } });
        if (!existing) {
          const newTender = tenderRepo.create({
            referenceNumber: item.referenceNumber,
            title: item.title,
            issuingAuthority: item.issuingAuthority,
            estimatedValue: item.estimatedValue,
            procurementCategory: item.procurementCategory,
            description: item.description,
          } as Partial<TenderEntity>);
          await tenderRepo.save(newTender);
        }
      }

      return { success: true, count: liveItems.length };
    } catch (error) {
      console.error('Tender Sync Error:', error);
      throw new InternalServerErrorException('Live tender synchronization failed');
    }
  }

  private async getRealOrgId(): Promise<string> {
    const orgRepo = this.dataSource.getRepository(OrganizationEntity);
    const orgs = await orgRepo.find({ take: 1 });
    if (orgs && orgs.length > 0) {
      return orgs[0].id;
    }
    throw new InternalServerErrorException('No organization record found in database.');
  }

  @Post('pipeline/:tenderId')
  async saveToPipeline(
    @Param('orgId') orgId: string,
    @Param('tenderId') tenderId: string,
  ) {
    const pipelineRepo = this.dataSource.getRepository(PipelineItemEntity);
    const realOrgId = await this.getRealOrgId();
    
    let existing = await pipelineRepo.findOne({ where: { tenderId, organizationId: realOrgId } });
    if (existing) {
      return existing; 
    }

    // Type-safe partial creation
    const newItem = pipelineRepo.create({
      organizationId: realOrgId,
      tenderId: tenderId,
      status: 'Drafting',
    } as Partial<PipelineItemEntity>);

    return await pipelineRepo.save(newItem);
  }

  @Get('pipeline')
  async getPipeline(@Param('orgId') orgId: string) {
    const pipelineRepo = this.dataSource.getRepository(PipelineItemEntity);
    const tenderRepo = this.dataSource.getRepository(TenderEntity);
    const realOrgId = await this.getRealOrgId();
    
    const pipelineItems = await pipelineRepo.find({ where: { organizationId: realOrgId } });
    
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
    await pipelineRepo.delete(id);
    return { success: true };
  }
}