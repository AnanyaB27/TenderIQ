import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsageCounterEntity } from '@app/database/entities/billing/usage-counter.entity';

import {
  CreateUsageCounterDto,
  UpdateUsageCounterDto,
} from './dto';

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(UsageCounterEntity)
    private readonly usageCounterRepository: Repository<UsageCounterEntity>,
  ) {}

  async create(
    dto: CreateUsageCounterDto,
  ): Promise<UsageCounterEntity> {
    const usageCounter = this.usageCounterRepository.create(dto);

    return this.usageCounterRepository.save(usageCounter);
  }

  async findAll(): Promise<UsageCounterEntity[]> {
    return this.usageCounterRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<UsageCounterEntity> {
    const usageCounter = await this.usageCounterRepository.findOneBy({
      id,
    });

    if (!usageCounter) {
      throw new NotFoundException(
        `Usage counter with ID '${id}' was not found.`,
      );
    }

    return usageCounter;
  }

  async update(
    id: string,
    dto: UpdateUsageCounterDto,
  ): Promise<UsageCounterEntity> {
    const usageCounter = await this.findOne(id);

    this.usageCounterRepository.merge(usageCounter, dto);

    return this.usageCounterRepository.save(usageCounter);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.usageCounterRepository.delete(id);

    return {
      success: true,
      message: 'Usage counter deleted successfully.',
    };
  }
}
