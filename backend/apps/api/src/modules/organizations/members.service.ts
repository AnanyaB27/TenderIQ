import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationMemberEntity } from '../../../../../libs/database/entities/identity/organization-member.entity';

import {
  CreateMemberDto,
  UpdateMemberDto,
} from './dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(OrganizationMemberEntity)
    private readonly memberRepository: Repository<OrganizationMemberEntity>,
  ) {}

  async create(
    dto: CreateMemberDto,
  ): Promise<OrganizationMemberEntity> {
    const member = this.memberRepository.create(dto);

    return this.memberRepository.save(member);
  }

  async findAll(): Promise<OrganizationMemberEntity[]> {
    return this.memberRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<OrganizationMemberEntity> {
    const member = await this.memberRepository.findOneBy({
      id,
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID '${id}' was not found.`,
      );
    }

    return member;
  }

  async update(
    id: string,
    dto: UpdateMemberDto,
  ): Promise<OrganizationMemberEntity> {
    const member = await this.findOne(id);

    this.memberRepository.merge(member, dto);

    return this.memberRepository.save(member);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.memberRepository.delete(id);

    return {
      success: true,
      message: 'Member deleted successfully.',
    };
  }
}