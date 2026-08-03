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

import { OrganizationSubscriptionEntity } from '@app/database/entities/billing/organization-subscription.entity';

import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new organization subscription',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully.',
    type: OrganizationSubscriptionEntity,
  })
  create(
    @Body() dto: CreateSubscriptionDto,
  ): Promise<OrganizationSubscriptionEntity> {
    return this.subscriptionsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all organization subscriptions',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully.',
    type: [OrganizationSubscriptionEntity],
  })
  findAll(): Promise<OrganizationSubscriptionEntity[]> {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an organization subscription by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Subscription UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully.',
    type: OrganizationSubscriptionEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationSubscriptionEntity> {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an organization subscription',
  })
  @ApiParam({
    name: 'id',
    description: 'Subscription UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully.',
    type: OrganizationSubscriptionEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubscriptionDto,
  ): Promise<OrganizationSubscriptionEntity> {
    return this.subscriptionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an organization subscription',
  })
  @ApiParam({
    name: 'id',
    description: 'Subscription UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.subscriptionsService.remove(id);
  }
}
