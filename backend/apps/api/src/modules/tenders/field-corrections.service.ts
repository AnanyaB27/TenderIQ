import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenderFieldCorrectionEntity } from '@app/database/entities/tender/tender-field-correction.entity';

import {
  CreateFieldCorrectionDto,
  UpdateFieldCorrectionDto,
} from './dto';

@Injectable()
export class FieldCorrectionsService {
  constructor(
    @InjectRepository(TenderFieldCorrectionEntity)
    private readonly fieldCorrectionRepository: Repository<TenderFieldCorrectionEntity>,
  ) {}

  async create(
    dto: CreateFieldCorrectionDto,
  ): Promise<TenderFieldCorrectionEntity> {
    const fieldCorrection = this.fieldCorrectionRepository.create(dto);

    return this.fieldCorrectionRepository.save(fieldCorrection);
  }

  async findAll(): Promise<TenderFieldCorrectionEntity[]> {
    return this.fieldCorrectionRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TenderFieldCorrectionEntity> {
    const fieldCorrection = await this.fieldCorrectionRepository.findOneBy({
      id,
    });

    if (!fieldCorrection) {
      throw new NotFoundException(
        `Tender field correction with ID '${id}' was not found.`,
      );
    }

    return fieldCorrection;
  }

  async update(
    id: string,
    dto: UpdateFieldCorrectionDto,
  ): Promise<TenderFieldCorrectionEntity> {
    const fieldCorrection = await this.findOne(id);

    this.fieldCorrectionRepository.merge(fieldCorrection, dto);

    return this.fieldCorrectionRepository.save(fieldCorrection);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.fieldCorrectionRepository.delete(id);

    return {
      success: true,
      message: 'Tender field correction deleted successfully.',
    };
  }
}
