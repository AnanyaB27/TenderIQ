import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChecklistTaskEntity } from '@app/database/entities/pipeline/checklist-task.entity';

import {
  CreateChecklistTaskDto,
  UpdateChecklistTaskDto,
} from './dto';

@Injectable()
export class ChecklistTasksService {
  constructor(
    @InjectRepository(ChecklistTaskEntity)
    private readonly checklistTaskRepository: Repository<ChecklistTaskEntity>,
  ) {}

  async create(
    dto: CreateChecklistTaskDto,
  ): Promise<ChecklistTaskEntity> {
    const checklistTask = this.checklistTaskRepository.create(dto);

    return this.checklistTaskRepository.save(checklistTask);
  }

  async findAll(): Promise<ChecklistTaskEntity[]> {
    return this.checklistTaskRepository.find({
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<ChecklistTaskEntity> {
    const checklistTask = await this.checklistTaskRepository.findOneBy({
      id,
    });

    if (!checklistTask) {
      throw new NotFoundException(
        `Checklist task with ID '${id}' was not found.`,
      );
    }

    return checklistTask;
  }

  async update(
    id: string,
    dto: UpdateChecklistTaskDto,
  ): Promise<ChecklistTaskEntity> {
    const checklistTask = await this.findOne(id);

    this.checklistTaskRepository.merge(checklistTask, dto);

    return this.checklistTaskRepository.save(checklistTask);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.checklistTaskRepository.delete(id);

    return {
      success: true,
      message: 'Checklist task deleted successfully.',
    };
  }
}
