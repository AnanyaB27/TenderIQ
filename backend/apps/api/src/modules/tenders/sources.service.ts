import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenderSourceEntity } from '@app/database/entities/tender/tender-source.entity';

import {
  CreateTenderSourceDto,
  UpdateTenderSourceDto,
} from './dto';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(TenderSourceEntity)
    private readonly sourceRepository: Repository<TenderSourceEntity>,
  ) {}

  async create(
    dto: CreateTenderSourceDto,
  ): Promise<TenderSourceEntity> {
    const source = this.sourceRepository.create(dto);

    return this.sourceRepository.save(source);
  }

  async findAll(): Promise<TenderSourceEntity[]> {
    return this.sourceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TenderSourceEntity> {
    const source = await this.sourceRepository.findOneBy({
      id,
    });

    if (!source) {
      throw new NotFoundException(
        `Tender source with ID '${id}' was not found.`,
      );
    }

    return source;
  }

  async update(
    id: string,
    dto: UpdateTenderSourceDto,
  ): Promise<TenderSourceEntity> {
    const source = await this.findOne(id);

    this.sourceRepository.merge(source, dto);

    return this.sourceRepository.save(source);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.sourceRepository.delete(id);

    return {
      success: true,
      message: 'Tender source deleted successfully.',
    };
  }
}
