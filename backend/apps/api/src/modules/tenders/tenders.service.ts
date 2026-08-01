import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenderEntity } from '@app/database/entities/tender/tender.entity';

import {
  CreateTenderDto,
  UpdateTenderDto,
} from './dto';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(TenderEntity)
    private readonly tenderRepository: Repository<TenderEntity>,
  ) {}

  async create(
    dto: CreateTenderDto,
  ): Promise<TenderEntity> {
    const tender = this.tenderRepository.create(dto);

    return this.tenderRepository.save(tender);
  }

  async findAll(): Promise<TenderEntity[]> {
    return this.tenderRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TenderEntity> {
    const tender = await this.tenderRepository.findOneBy({
      id,
    });

    if (!tender) {
      throw new NotFoundException(
        `Tender with ID '${id}' was not found.`,
      );
    }

    return tender;
  }

  async update(
    id: string,
    dto: UpdateTenderDto,
  ): Promise<TenderEntity> {
    const tender = await this.findOne(id);

    this.tenderRepository.merge(tender, dto);

    return this.tenderRepository.save(tender);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.tenderRepository.delete(id);

    return {
      success: true,
      message: 'Tender deleted successfully.',
    };
  }
}