import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PipelineItemEntity } from '@app/database/entities/pipeline/pipeline-item.entity';

import {
  CreatePipelineItemDto,
  UpdatePipelineItemDto,
} from './dto';

@Injectable()
export class PipelineItemsService {
  constructor(
    @InjectRepository(PipelineItemEntity)
    private readonly pipelineItemRepository: Repository<PipelineItemEntity>,
  ) {}

  async create(
    dto: CreatePipelineItemDto,
  ): Promise<PipelineItemEntity> {
    const pipelineItem = this.pipelineItemRepository.create(dto);

    return this.pipelineItemRepository.save(pipelineItem);
  }

  async findAll(): Promise<PipelineItemEntity[]> {
    return this.pipelineItemRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<PipelineItemEntity> {
    const pipelineItem = await this.pipelineItemRepository.findOneBy({
      id,
    });

    if (!pipelineItem) {
      throw new NotFoundException(
        `Pipeline item with ID '${id}' was not found.`,
      );
    }

    return pipelineItem;
  }

  async update(
    id: string,
    dto: UpdatePipelineItemDto,
  ): Promise<PipelineItemEntity> {
    const pipelineItem = await this.findOne(id);

    this.pipelineItemRepository.merge(pipelineItem, dto);

    return this.pipelineItemRepository.save(pipelineItem);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.pipelineItemRepository.delete(id);

    return {
      success: true,
      message: 'Pipeline item deleted successfully.',
    };
  }
}
