import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MsmeCertificationEntity } from '@app/database/entities/identity/msme-certification.entity';

import {
  CreateCertificationDto,
  UpdateCertificationDto,
} from './dto';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectRepository(MsmeCertificationEntity)
    private readonly certificationRepository: Repository<MsmeCertificationEntity>,
  ) {}

  async create(
    dto: CreateCertificationDto,
  ): Promise<MsmeCertificationEntity> {
    const certification = this.certificationRepository.create(dto);

    return this.certificationRepository.save(certification);
  }

  async findAll(): Promise<MsmeCertificationEntity[]> {
    return this.certificationRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<MsmeCertificationEntity> {
    const certification = await this.certificationRepository.findOneBy({
      id,
    });

    if (!certification) {
      throw new NotFoundException(
        `Certification with ID '${id}' was not found.`,
      );
    }

    return certification;
  }

  async update(
    id: string,
    dto: UpdateCertificationDto,
  ): Promise<MsmeCertificationEntity> {
    const certification = await this.findOne(id);

    this.certificationRepository.merge(certification, dto);

    return this.certificationRepository.save(certification);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.certificationRepository.delete(id);

    return {
      success: true,
      message: 'Certification deleted successfully.',
    };
  }
}
