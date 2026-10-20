
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TenderEntity,
  TenderType,
  TenderStatus,
} from '@app/database/entities/tender/tender.entity';
import { TenderDocumentEntity } from '@app/database/entities/tender/tender-document.entity';
import { GetTendersDto } from './dto/get-tenders.dto';
import { AiGatewayService } from '../ai/ai-gateway.service';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(TenderEntity)
    private readonly tenderRepo: Repository<TenderEntity>,

    @InjectRepository(TenderDocumentEntity)
    private readonly documentRepo: Repository<TenderDocumentEntity>,

    private readonly aiGatewayService: AiGatewayService,
  ) {}

  private isValidUUID(value?: string | null): value is string {
    return (
      !!value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      )
    );
  }

  async findAll(query: GetTendersDto & { organizationId?: string }) {
    const {
      search,
      category,
      authority,
      organizationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = query;

    if (organizationId && !this.isValidUUID(organizationId)) {
      throw new BadRequestException('Invalid organizationId.');
    }

    const qb = this.tenderRepo.createQueryBuilder('tender');

    if (organizationId) {
      qb.andWhere(
        "(tender.organizationId IS NULL OR tender.organizationId = :orgId OR tender.tenderType IN ('open', 'global'))",
        { orgId: organizationId },
      );
    } else {
      qb.andWhere(
        "(tender.organizationId IS NULL OR tender.tenderType IN ('open', 'global'))",
      );
    }

    if (search) {
      qb.andWhere(
        '(tender.title ILIKE :search OR tender.referenceNumber ILIKE :search OR tender.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      qb.andWhere(
        'tender.procurementCategory = :category',
        { category },
      );
    }

    if (authority) {
      qb.andWhere(
        'tender.issuingAuthority = :authority',
        { authority },
      );
    }

    const allowedSortColumns = [
      'title',
      'estimatedValue',
      'createdAt',
      'submissionDeadline',
    ];

    const actualSortBy = allowedSortColumns.includes(sortBy)
      ? sortBy
      : 'createdAt';

    qb.orderBy(
      `tender.${actualSortBy}`,
      sortOrder === 'ASC' ? 'ASC' : 'DESC',
    );

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneForOrganization(
    id: string,
    organizationId?: string,
  ): Promise<TenderEntity> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid Tender ID format.');
    }

    if (organizationId && !this.isValidUUID(organizationId)) {
      throw new BadRequestException('Invalid organizationId.');
    }

    const tender = await this.tenderRepo.findOne({
      where: { id, isActive: true },
    });

    if (!tender) {
      throw new NotFoundException(
        `Tender with ID ${id} not found.`,
      );
    }

    const isPublic =
      !tender.organizationId ||
      tender.tenderType === TenderType.OPEN ||
      tender.tenderType === TenderType.GLOBAL;

    const belongsToOrganization =
      !!organizationId &&
      tender.organizationId === organizationId;

    if (!isPublic && !belongsToOrganization) {
      throw new NotFoundException(
        `Tender with ID ${id} not found.`,
      );
    }

    return tender;
  }

  async uploadCustomTender(
    organizationId: string,
    userId: string,
    file: any,
    title: string,
  ) {
    if (!this.isValidUUID(organizationId)) {
      throw new BadRequestException(
        'A valid organizationId is required.',
      );
    }

    if (!this.isValidUUID(userId)) {
      throw new BadRequestException(
        'A valid authenticated user is required.',
      );
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('A PDF file is required.');
    }

    if (
      file.mimetype !== 'application/pdf' &&
      !file.originalname?.toLowerCase().endsWith('.pdf')
    ) {
      throw new BadRequestException(
        'Only PDF files are supported.',
      );
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new BadRequestException(
        'PDF must be 15 MB or smaller.',
      );
    }

    // Save the tender first.
    const tender = await this.tenderRepo.save(
      this.tenderRepo.create({
        organizationId,
        createdByUserId: userId,
        title: (title || file.originalname || 'Private Tender')
          .trim()
          .slice(0, 500),
        referenceNumber: `CUSTOM-${Date.now()}-${Math.floor(
          Math.random() * 1000000,
        )}`,
        source: 'User Upload',
        tenderType: TenderType.LIMITED,
        status: TenderStatus.ACTIVE,
        documentUrl: file.originalname,
        isActive: true,
      }),
    );

    // Create a separate document record linked to that tender.
    const document = await this.documentRepo.save(
      this.documentRepo.create({
        organizationId,
        tenderId: tender.id,
        fileName: file.originalname.slice(0, 255),
        fileType: file.mimetype || 'application/pdf',
        fileSize: file.size,
        extractionStatus: 'PROCESSING',
        pageCount: 0,
        extractedText: null,
        documentSummary: null,
        extractedMetadata: null,
      }),
    );

    // Build a consistent response for both successful and failed
    // extraction. The document ID exists independently of extraction.
    const buildResponse = (extractionError?: string) => ({
      ...tender,
      id: tender.id,
      tenderId: tender.id,
      documentId: document.id,
      document: {
        id: document.id,
        tenderId: tender.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        extractionStatus: document.extractionStatus,
      },
      extractionStatus: document.extractionStatus,
      pageCount: document.pageCount,
      documentSummary: document.documentSummary,
      metadata: document.extractedMetadata,
      ...(extractionError ? { extractionError } : {}),
    });

    try {
      const extraction =
        await this.aiGatewayService.extractDocumentText(
          document.id,
          file.buffer,
          file.mimetype || 'application/pdf',
          file.originalname,
        );

      const aiStatus = String(
        extraction?.status || '',
      ).toUpperCase();

      if (aiStatus === 'SUCCESS' || aiStatus === 'READY') {
        document.extractionStatus = 'READY';
      } else if (aiStatus === 'NO_EXTRACTABLE_TEXT') {
        document.extractionStatus = 'NO_EXTRACTABLE_TEXT';
      } else {
        document.extractionStatus = 'FAILED';
      }

      document.extractedText =
        typeof extraction?.extracted_text === 'string'
          ? extraction.extracted_text
          : null;

      document.pageCount =
        typeof extraction?.page_count === 'number'
          ? extraction.page_count
          : 0;

      document.documentSummary =
        typeof extraction?.summary === 'string'
          ? extraction.summary
          : null;

      document.extractedMetadata =
        extraction?.metadata &&
        typeof extraction.metadata === 'object'
          ? extraction.metadata
          : null;

      await this.documentRepo.save(document);

      return buildResponse(
        document.extractionStatus === 'FAILED'
          ? 'Document extraction did not complete successfully.'
          : undefined,
      );
    } catch (error: unknown) {
      document.extractionStatus = 'FAILED';
      await this.documentRepo.save(document);

      const extractionError =
        error instanceof Error
          ? error.message
          : 'Document extraction failed. Please retry the upload.';

      // Preserve the created tender and document identifiers even
      // when the AI extraction service fails.
      return buildResponse(extractionError);
    }
  }

  async remove(
    id: string,
    organizationId?: string,
  ): Promise<{ success: boolean }> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid Tender ID format.');
    }

    if (!this.isValidUUID(organizationId)) {
      throw new BadRequestException(
        'A valid organizationId is required.',
      );
    }

    const tender = await this.tenderRepo.findOne({
      where: {
        id,
        organizationId,
        isActive: true,
      },
    });

    if (!tender) {
      throw new NotFoundException(
        `Tender with ID ${id} not found.`,
      );
    }

    if (
      ![TenderType.LIMITED, TenderType.SINGLE].includes(
        tender.tenderType,
      ) ||
      tender.source !== 'User Upload'
    ) {
      throw new ForbiddenException(
        'Only custom tenders uploaded by your organization can be deleted.',
      );
    }

    await this.tenderRepo.delete({ id, organizationId });

    return { success: true };
  }
}
