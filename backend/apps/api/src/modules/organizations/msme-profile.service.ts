import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MsmeProfileEntity } from '@app/database/entities/identity/msme-profile.entity';

import {
  CreateMsmeProfileDto,
  UpdateMsmeProfileDto,
} from './dto';

@Injectable()
export class MsmeProfileService {
  constructor(
    @InjectRepository(MsmeProfileEntity)
    private readonly msmeProfileRepository: Repository<MsmeProfileEntity>,
  ) {}

  async create(
    dto: CreateMsmeProfileDto,
  ): Promise<MsmeProfileEntity> {
    const profile = this.msmeProfileRepository.create(dto);

    return this.msmeProfileRepository.save(profile);
  }

  async findAll(): Promise<MsmeProfileEntity[]> {
    return this.msmeProfileRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<MsmeProfileEntity> {
    const profile = await this.msmeProfileRepository.findOneBy({
      id,
    });

    if (!profile) {
      throw new NotFoundException(
        `MSME profile with ID '${id}' was not found.`,
      );
    }

    return profile;
  }

  async update(
    id: string,
    dto: UpdateMsmeProfileDto,
  ): Promise<MsmeProfileEntity> {
    const profile = await this.findOne(id);

    this.msmeProfileRepository.merge(profile, dto);

    return this.msmeProfileRepository.save(profile);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.msmeProfileRepository.delete(id);

    return {
      success: true,
      message: 'MSME profile deleted successfully.',
    };
  }
}