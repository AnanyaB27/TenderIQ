import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DsrRequestEntity } from '@app/database/entities/billing/dsr-request.entity';

import {
  CreateDsrRequestDto,
  UpdateDsrRequestDto,
} from './dto';

@Injectable()
export class DsrRequestsService {
  constructor(
    @InjectRepository(DsrRequestEntity)
    private readonly dsrRequestRepository: Repository<DsrRequestEntity>,
  ) {}

  async create(
    dto: CreateDsrRequestDto,
  ): Promise<DsrRequestEntity> {
    const dsrRequest = this.dsrRequestRepository.create(dto);

    return this.dsrRequestRepository.save(dsrRequest);
  }

  async findAll(): Promise<DsrRequestEntity[]> {
    return this.dsrRequestRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<DsrRequestEntity> {
    const dsrRequest = await this.dsrRequestRepository.findOneBy({
      id,
    });

    if (!dsrRequest) {
      throw new NotFoundException(
        `Data subject request with ID '${id}' was not found.`,
      );
    }

    return dsrRequest;
  }

  async update(
    id: string,
    dto: UpdateDsrRequestDto,
  ): Promise<DsrRequestEntity> {
    const dsrRequest = await this.findOne(id);

    this.dsrRequestRepository.merge(dsrRequest, dto);

    return this.dsrRequestRepository.save(dsrRequest);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.dsrRequestRepository.delete(id);

    return {
      success: true,
      message: 'Data subject request deleted successfully.',
    };
  }
}
