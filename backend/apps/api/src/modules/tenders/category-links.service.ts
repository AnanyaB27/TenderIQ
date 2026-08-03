import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenderCategoryLinkEntity } from '@app/database/entities/tender/tender-category-link.entity';

import {
  CreateCategoryLinkDto,
  UpdateCategoryLinkDto,
} from './dto';

@Injectable()
export class CategoryLinksService {
  constructor(
    @InjectRepository(TenderCategoryLinkEntity)
    private readonly categoryLinkRepository: Repository<TenderCategoryLinkEntity>,
  ) {}

  async create(
    dto: CreateCategoryLinkDto,
  ): Promise<TenderCategoryLinkEntity> {
    const categoryLink = this.categoryLinkRepository.create(dto);

    return this.categoryLinkRepository.save(categoryLink);
  }

  async findAll(): Promise<TenderCategoryLinkEntity[]> {
    return this.categoryLinkRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TenderCategoryLinkEntity> {
    const categoryLink = await this.categoryLinkRepository.findOneBy({
      id,
    });

    if (!categoryLink) {
      throw new NotFoundException(
        `Tender category link with ID '${id}' was not found.`,
      );
    }

    return categoryLink;
  }

  async update(
    id: string,
    dto: UpdateCategoryLinkDto,
  ): Promise<TenderCategoryLinkEntity> {
    const categoryLink = await this.findOne(id);

    this.categoryLinkRepository.merge(categoryLink, dto);

    return this.categoryLinkRepository.save(categoryLink);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.categoryLinkRepository.delete(id);

    return {
      success: true,
      message: 'Tender category link deleted successfully.',
    };
  }
}
