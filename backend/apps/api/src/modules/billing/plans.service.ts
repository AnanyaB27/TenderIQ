import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SubscriptionPlanEntity } from '@app/database/entities/billing/subscription-plan.entity';

import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from './dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(SubscriptionPlanEntity)
    private readonly planRepository: Repository<SubscriptionPlanEntity>,
  ) {}

  async create(
    dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanEntity> {
    const plan = this.planRepository.create(dto);

    return this.planRepository.save(plan);
  }

  async findAll(): Promise<SubscriptionPlanEntity[]> {
    return this.planRepository.find({
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<SubscriptionPlanEntity> {
    const plan = await this.planRepository.findOneBy({
      id,
    });

    if (!plan) {
      throw new NotFoundException(
        `Subscription plan with ID '${id}' was not found.`,
      );
    }

    return plan;
  }

  async update(
    id: string,
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanEntity> {
    const plan = await this.findOne(id);

    this.planRepository.merge(plan, dto);

    return this.planRepository.save(plan);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.planRepository.delete(id);

    return {
      success: true,
      message: 'Subscription plan deleted successfully.',
    };
  }
}
