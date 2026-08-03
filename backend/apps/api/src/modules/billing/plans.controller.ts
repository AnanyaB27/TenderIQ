import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SubscriptionPlanEntity } from '@app/database/entities/billing/subscription-plan.entity';

import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from './dto';
import { PlansService } from './plans.service';

@ApiTags('Subscription Plans')
@Controller('subscription-plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new subscription plan',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription plan created successfully.',
    type: SubscriptionPlanEntity,
  })
  create(
    @Body() dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanEntity> {
    return this.plansService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all subscription plans',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plans retrieved successfully.',
    type: [SubscriptionPlanEntity],
  })
  findAll(): Promise<SubscriptionPlanEntity[]> {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a subscription plan by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Subscription plan UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan retrieved successfully.',
    type: SubscriptionPlanEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SubscriptionPlanEntity> {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a subscription plan',
  })
  @ApiParam({
    name: 'id',
    description: 'Subscription plan UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan updated successfully.',
    type: SubscriptionPlanEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanEntity> {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a subscription plan',
  })
  @ApiParam({
    name: 'id',
    description: 'Subscription plan UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.plansService.remove(id);
  }
}
