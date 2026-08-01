import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationInvitationEntity } from '@app/database/entities/identity/organization-invitation.entity';

import {
  CreateInvitationDto,
  UpdateInvitationDto,
} from './dto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(OrganizationInvitationEntity)
    private readonly invitationRepository: Repository<OrganizationInvitationEntity>,
  ) {}

  async create(
    dto: CreateInvitationDto,
  ): Promise<OrganizationInvitationEntity> {
    const invitation = this.invitationRepository.create(dto);

    return this.invitationRepository.save(invitation);
  }

  async findAll(): Promise<OrganizationInvitationEntity[]> {
    return this.invitationRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<OrganizationInvitationEntity> {
    const invitation = await this.invitationRepository.findOneBy({
      id,
    });

    if (!invitation) {
      throw new NotFoundException(
        `Invitation with ID '${id}' was not found.`,
      );
    }

    return invitation;
  }

  async update(
    id: string,
    dto: UpdateInvitationDto,
  ): Promise<OrganizationInvitationEntity> {
    const invitation = await this.findOne(id);

    this.invitationRepository.merge(invitation, dto);

    return this.invitationRepository.save(invitation);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.invitationRepository.delete(id);

    return {
      success: true,
      message: 'Invitation deleted successfully.',
    };
  }
}