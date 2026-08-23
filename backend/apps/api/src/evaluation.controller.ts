import { Controller, Post, Get, Delete, Param, Body, UploadedFile, UseInterceptors, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { TenderEntity } from '@app/database/entities/tender/tender.entity';
import { PipelineItemEntity } from '@app/database/entities/pipeline/pipeline-item.entity';
import { OrganizationEntity } from '@app/database/entities/identity/organization.entity';

@Controller('organizations/:orgId')
export class EvaluationController {
  constructor(private readonly dataSource: DataSource) {}
  
  @Post('tenders/:tenderId/evaluate')
  async evaluateTender(
    @Param('orgId') orgId: string, 
    @Param('tenderId') tenderId: string,
    @Body('dynamicContext') dynamicContext?: string,
  ) {
    const tender = await this.dataSource.getRepository(TenderEntity).findOneBy({ id: tenderId });
    
    if (!tender) {
      throw new InternalServerErrorException('Tender not found in database');
    }

    const orgCapabilities = dynamicContext || "Core technical competencies in artificial intelligence, machine learning, and hardware integration. Proven track record deploying AI-driven wildlife detection cameras using Raspberry Pi and Arduino-powered automated laser fencing systems for perimeter security.";

    try {
      const response = await fetch(`http://localhost:8000/internal/orgs/${orgId}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tender_id: tenderId,
          tender_title: tender.title,
          tender_description: tender.description || tender.procurementCategory || 'General Procurement',
          org_capabilities: orgCapabilities,
          dynamic_context: dynamicContext || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Python AI Engine failed with status: ${response.status}`);
      }
      
      return await response.json();

    } catch (error) {
      console.error('Gateway Error calling AI Engine:', error);
      throw new InternalServerErrorException('Failed to process AI evaluation');
    }
  }

  @Post('documents/extract')
  @UseInterceptors(FileInterceptor('file'))
  async extractDocument(@UploadedFile() file: any) {
    if (!file) {
      throw new InternalServerErrorException('No file uploaded');
    }

    try {
      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('file', blob, file.originalname);

      const response = await fetch('http://localhost:8000/internal/documents/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from document in AI engine');
      }

      return await response.json();
    } catch (error) {
      console.error('Document Extraction Error:', error);
      throw new InternalServerErrorException('Document parsing failed');
    }
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
        let existing = await tenderRepo.findOneBy({ referenceNumber: item.referenceNumber } as any);
        if (!existing) {
          const newTender = tenderRepo.create({
            referenceNumber: item.referenceNumber,
            title: item.title,
            issuingAuthority: item.issuingAuthority,
            estimatedValue: item.estimatedValue,
            procurementCategory: item.procurementCategory,
            description: item.description,
          } as any);
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
    const orgs = await orgRepo.find({ take: 1 } as any);
    if (orgs && orgs.length > 0) {
      return orgs[0].id;
    }
    throw new InternalServerErrorException('No organization record found in database.');
  }

  @Post('pipeline/:tenderId')
  async saveToPipeline(
    @Param('orgId') orgId: string,
    @Param('tenderId') tenderId: string,
    @Body() body: { title: string; authority: string; value: number }
  ) {
    const pipelineRepo = this.dataSource.getRepository(PipelineItemEntity);
    const realOrgId = await this.getRealOrgId();
    
    // Look up by tenderId and update if exists
    let existing = await pipelineRepo.findOneBy({ tenderId } as any);
    if (existing) {
      const exAny = existing as any;
      exAny.tenderTitle = body.title && body.title !== 'Untitled Tender' ? body.title : exAny.tenderTitle;
      exAny.issuingAuthority = body.authority || exAny.issuingAuthority;
      exAny.estimatedValue = body.value || exAny.estimatedValue;
      return await pipelineRepo.save(existing);
    }

    const newItem = pipelineRepo.create({
      organizationId: realOrgId,
      tenderId,
      tenderTitle: body.title || 'Supply & Installation of IoT Wildlife Monitoring Cameras',
      issuingAuthority: body.authority || 'Ministry of Environment',
      estimatedValue: body.value || 4500000,
      status: 'Drafting',
    } as any);

    return await pipelineRepo.save(newItem);
  }

  @Get('pipeline')
  async getPipeline(@Param('orgId') orgId: string) {
    const pipelineRepo = this.dataSource.getRepository(PipelineItemEntity);
    const realOrgId = await this.getRealOrgId();
    return await pipelineRepo.find({ where: { organizationId: realOrgId } as any });
  }

  @Delete('pipeline/:id')
  async deleteFromPipeline(@Param('orgId') orgId: string, @Param('id') id: string) {
    const pipelineRepo = this.dataSource.getRepository(PipelineItemEntity);
    await pipelineRepo.delete(id);
    return { success: true };
  }
}