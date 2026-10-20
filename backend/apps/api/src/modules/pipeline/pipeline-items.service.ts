
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PipelineItemEntity } from '@app/database/entities/pipeline/pipeline-item.entity';
import {
  TenderEntity,
  TenderType,
} from '@app/database/entities/tender/tender.entity';

import {
  CreatePipelineItemDto,
  UpdatePipelineItemDto,
} from './dto';

@Injectable()
export class PipelineItemsService {
  constructor(
    @InjectRepository(PipelineItemEntity)
    private readonly pipelineItemRepository: Repository<PipelineItemEntity>,

    @InjectRepository(TenderEntity)
    private readonly tenderRepository: Repository<TenderEntity>,
  ) {}

  private validateOrganizationId(organizationId: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!organizationId || !uuidRegex.test(organizationId)) {
      throw new BadRequestException('A valid organizationId is required.');
    }
  }

  private async ensureTenderVisible(
    tenderId: string,
    organizationId: string,
  ): Promise<void> {
    const tender = await this.tenderRepository.findOne({
      where: {
        id: tenderId,
        isActive: true,
      },
    });

    if (!tender) {
      throw new NotFoundException(
        'The requested tender does not exist or is unavailable.',
      );
    }

    const isPublic =
      tender.tenderType === TenderType.OPEN ||
      tender.tenderType === TenderType.GLOBAL;

    const belongsToOrganization =
      tender.organizationId === organizationId;

    const isPrivate =
      tender.tenderType === TenderType.LIMITED ||
      tender.tenderType === TenderType.SINGLE;

    if (!isPublic && !(isPrivate && belongsToOrganization)) {
      throw new NotFoundException(
        'The requested tender does not exist or is unavailable.',
      );
    }
  }

  async create(
    dto: CreatePipelineItemDto,
  ): Promise<PipelineItemEntity> {
    this.validateOrganizationId(dto.organizationId);

    await this.ensureTenderVisible(dto.tenderId, dto.organizationId);

    const pipelineItem = this.pipelineItemRepository.create({
      organizationId: dto.organizationId,
      tenderId: dto.tenderId,
      stage: dto.stage,
      priority: dto.priority,
      assignedToUserId: dto.assignedToUserId ?? null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      notes: dto.notes ?? null,
      isArchived: dto.isArchived ?? false,
    });

    return this.pipelineItemRepository.save(pipelineItem);
  }

  async findAll(
    organizationId: string,
  ): Promise<PipelineItemEntity[]> {
    this.validateOrganizationId(organizationId);

    return this.pipelineItemRepository.find({
      where: {
        organizationId,
      },
      relations: {
        tender: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<PipelineItemEntity> {
    this.validateOrganizationId(organizationId);

    const pipelineItem = await this.pipelineItemRepository.findOne({
      where: {
        id,
        organizationId,
      },
      relations: {
        tender: true,
      },
    });

    if (!pipelineItem) {
      throw new NotFoundException(
        'Pipeline item not found in this organization.',
      );
    }

    return pipelineItem;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdatePipelineItemDto,
  ): Promise<PipelineItemEntity> {
    const pipelineItem = await this.findOne(id, organizationId);

    // Only allow editable workflow fields. Do not allow the client to
    // change organizationId or tenderId through this endpoint.
    if (dto.stage !== undefined) {
      pipelineItem.stage = dto.stage;
    }

    if (dto.priority !== undefined) {
      pipelineItem.priority = dto.priority;
    }

    if (dto.assignedToUserId !== undefined) {
      pipelineItem.assignedToUserId = dto.assignedToUserId;
    }

    if (dto.dueDate !== undefined) {
      pipelineItem.dueDate = dto.dueDate
        ? new Date(dto.dueDate)
        : null;
    }

    if (dto.notes !== undefined) {
      pipelineItem.notes = dto.notes;
    }

    if (dto.isArchived !== undefined) {
      pipelineItem.isArchived = dto.isArchived;
    }

    return this.pipelineItemRepository.save(pipelineItem);
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<{ success: boolean; message: string }> {
    const pipelineItem = await this.findOne(id, organizationId);

    await this.pipelineItemRepository.delete({
      id: pipelineItem.id,
      organizationId,
    });

    return {
      success: true,
      message: 'Pipeline item deleted successfully.',
    };
  }
}
