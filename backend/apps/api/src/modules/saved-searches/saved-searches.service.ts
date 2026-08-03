import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SavedSearchEntity } from '@app/database/entities/pipeline/saved-search.entity';

import {
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from './dto';

@Injectable()
export class SavedSearchesService {
  constructor(
    @InjectRepository(SavedSearchEntity)
    private readonly savedSearchRepository: Repository<SavedSearchEntity>,
  ) {}

  async create(
    dto: CreateSavedSearchDto,
  ): Promise<SavedSearchEntity> {
    const savedSearch = this.savedSearchRepository.create(dto);

    return this.savedSearchRepository.save(savedSearch);
  }

  async findAll(): Promise<SavedSearchEntity[]> {
    return this.savedSearchRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<SavedSearchEntity> {
    const savedSearch = await this.savedSearchRepository.findOneBy({
      id,
    });

    if (!savedSearch) {
      throw new NotFoundException(
        `Saved search with ID '${id}' was not found.`,
      );
    }

    return savedSearch;
  }

  async update(
    id: string,
    dto: UpdateSavedSearchDto,
  ): Promise<SavedSearchEntity> {
    const savedSearch = await this.findOne(id);

    this.savedSearchRepository.merge(savedSearch, dto);

    return this.savedSearchRepository.save(savedSearch);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.savedSearchRepository.delete(id);

    return {
      success: true,
      message: 'Saved search deleted successfully.',
    };
  }
}
