import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const existing = await this.msmeProfileRepository.findOneBy({
      organizationId: dto.organizationId,
    });

    if (existing) {
      this.msmeProfileRepository.merge(existing, dto);
      return this.msmeProfileRepository.save(existing);
    }

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

  async findByOrganizationId(
    organizationId: string,
  ): Promise<MsmeProfileEntity | null> {
    return this.msmeProfileRepository.findOneBy({
      organizationId,
    });
  }

  async createOrUpdateForOrganization(
    organizationId: string,
    data: {
      turnoverInCrores?: number | null;
      yearsOfExperience?: number | null;
      operatingLocations?: string[] | null;
      coreCapabilities?: string[] | null;
    },
  ): Promise<MsmeProfileEntity> {
    let profile =
      await this.msmeProfileRepository.findOneBy({
        organizationId,
      });

    if (!profile) {
      profile = this.msmeProfileRepository.create({
        organizationId,
        annualTurnover:
          data.turnoverInCrores ?? null,
        yearsOfExperience:
          data.yearsOfExperience ?? null,
        operatingLocations:
          data.operatingLocations ?? null,
        coreCapabilities:
          data.coreCapabilities ?? null,
      });
    } else {
      profile.annualTurnover =
        data.turnoverInCrores ?? null;

      profile.yearsOfExperience =
        data.yearsOfExperience ?? null;

      profile.operatingLocations =
        data.operatingLocations ?? null;

      profile.coreCapabilities =
        data.coreCapabilities ?? null;
    }

    return this.msmeProfileRepository.save(profile);
  }

  async update(
    id: string,
    dto: UpdateMsmeProfileDto,
  ): Promise<MsmeProfileEntity> {
    const profile = await this.findOne(id);

    this.msmeProfileRepository.merge(
      profile,
      dto,
    );

    return this.msmeProfileRepository.save(profile);
  }

  async remove(
    id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.findOne(id);

    await this.msmeProfileRepository.delete(id);

    return {
      success: true,
      message:
        'MSME profile deleted successfully.',
    };
  }
}