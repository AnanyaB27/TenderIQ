import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BidDraftEntity } from '@app/database/entities/pipeline/bid-draft.entity';

import {
  CreateBidDraftDto,
  UpdateBidDraftDto,
} from './dto';

@Injectable()
export class BidDraftsService {
  constructor(
    @InjectRepository(BidDraftEntity)
    private readonly bidDraftRepository: Repository<BidDraftEntity>,
  ) {}

  async create(
    dto: CreateBidDraftDto,
  ): Promise<BidDraftEntity> {
    const bidDraft = this.bidDraftRepository.create(dto);

    return this.bidDraftRepository.save(bidDraft);
  }

  async findAll(): Promise<BidDraftEntity[]> {
    return this.bidDraftRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<BidDraftEntity> {
    const bidDraft = await this.bidDraftRepository.findOneBy({
      id,
    });

    if (!bidDraft) {
      throw new NotFoundException(
        `Bid draft with ID '${id}' was not found.`,
      );
    }

    return bidDraft;
  }

  async update(
    id: string,
    dto: UpdateBidDraftDto,
  ): Promise<BidDraftEntity> {
    const bidDraft = await this.findOne(id);

    this.bidDraftRepository.merge(bidDraft, dto);

    return this.bidDraftRepository.save(bidDraft);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.bidDraftRepository.delete(id);

    return {
      success: true,
      message: 'Bid draft deleted successfully.',
    };
  }
}
