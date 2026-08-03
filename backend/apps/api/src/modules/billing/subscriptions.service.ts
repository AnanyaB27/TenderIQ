import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationSubscriptionEntity } from '@app/database/entities/billing/organization-subscription.entity';

import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(OrganizationSubscriptionEntity)
    private readonly subscriptionRepository: Repository<OrganizationSubscriptionEntity>,
  ) {}

  async create(
    dto: CreateSubscriptionDto,
  ): Promise<OrganizationSubscriptionEntity> {
    const subscription = this.subscriptionRepository.create(dto);

    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<OrganizationSubscriptionEntity[]> {
    return this.subscriptionRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<OrganizationSubscriptionEntity> {
    const subscription = await this.subscriptionRepository.findOneBy({
      id,
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription with ID '${id}' was not found.`,
      );
    }

    return subscription;
  }

  async update(
    id: string,
    dto: UpdateSubscriptionDto,
  ): Promise<OrganizationSubscriptionEntity> {
    const subscription = await this.findOne(id);

    this.subscriptionRepository.merge(subscription, dto);

    return this.subscriptionRepository.save(subscription);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.subscriptionRepository.delete(id);

    return {
      success: true,
      message: 'Subscription deleted successfully.',
    };
  }
}
