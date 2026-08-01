import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationEntity } from '../../../../../libs/database/entities/identity/organization.entity';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {}

  async create(
    dto: CreateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const organization = this.organizationRepository.create(dto);

    return this.organizationRepository.save(organization);
  }

  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findOneBy({
      id,
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with ID '${id}' was not found.`,
      );
    }

    return organization;
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const organization = await this.findOne(id);

    this.organizationRepository.merge(organization, dto);

    return this.organizationRepository.save(organization);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.organizationRepository.delete(id);

    return {
      success: true,
      message: 'Organization deleted successfully.',
    };
  }
}