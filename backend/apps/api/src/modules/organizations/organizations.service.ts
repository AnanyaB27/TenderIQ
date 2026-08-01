import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { OrganizationEntity } from '../../../../../libs/database/entities/identity/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {}

  async create(
    organizationData: DeepPartial<OrganizationEntity>,
  ): Promise<OrganizationEntity> {
    const organization =
      this.organizationRepository.create(organizationData);

    return this.organizationRepository.save(organization);
  }

  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationRepository.find();
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
    organizationData: DeepPartial<OrganizationEntity>,
  ): Promise<OrganizationEntity> {
    const organization = await this.findOne(id);

    const updatedOrganization = this.organizationRepository.merge(
      organization,
      organizationData,
    );

    return this.organizationRepository.save(updatedOrganization);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.organizationRepository.delete(id);

    return {
      success: true,
      message: `Organization '${id}' deleted successfully.`,
    };
  }
}