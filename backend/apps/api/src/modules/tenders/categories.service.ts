import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenderCategoryEntity } from '@app/database/entities/tender/tender-category.entity';

import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(TenderCategoryEntity)
    private readonly categoryRepository: Repository<TenderCategoryEntity>,
  ) {}

  async create(
    dto: CreateCategoryDto,
  ): Promise<TenderCategoryEntity> {
    const category = this.categoryRepository.create(dto);

    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<TenderCategoryEntity[]> {
    return this.categoryRepository.find({
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TenderCategoryEntity> {
    const category = await this.categoryRepository.findOneBy({
      id,
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID '${id}' was not found.`,
      );
    }

    return category;
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<TenderCategoryEntity> {
    const category = await this.findOne(id);

    this.categoryRepository.merge(category, dto);

    return this.categoryRepository.save(category);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.categoryRepository.delete(id);

    return {
      success: true,
      message: 'Category deleted successfully.',
    };
  }
}