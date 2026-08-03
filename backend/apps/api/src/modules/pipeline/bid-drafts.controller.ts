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

import { BidDraftEntity } from '@app/database/entities/pipeline/bid-draft.entity';

import {
  CreateBidDraftDto,
  UpdateBidDraftDto,
} from './dto';
import { BidDraftsService } from './bid-drafts.service';

@ApiTags('Bid Drafts')
@Controller('bid-drafts')
export class BidDraftsController {
  constructor(
    private readonly bidDraftsService: BidDraftsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new bid draft',
  })
  @ApiResponse({
    status: 201,
    description: 'Bid draft created successfully.',
    type: BidDraftEntity,
  })
  create(
    @Body() dto: CreateBidDraftDto,
  ): Promise<BidDraftEntity> {
    return this.bidDraftsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all bid drafts',
  })
  @ApiResponse({
    status: 200,
    description: 'Bid drafts retrieved successfully.',
    type: [BidDraftEntity],
  })
  findAll(): Promise<BidDraftEntity[]> {
    return this.bidDraftsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a bid draft by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Bid draft UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Bid draft retrieved successfully.',
    type: BidDraftEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Bid draft not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BidDraftEntity> {
    return this.bidDraftsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a bid draft',
  })
  @ApiParam({
    name: 'id',
    description: 'Bid draft UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Bid draft updated successfully.',
    type: BidDraftEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Bid draft not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBidDraftDto,
  ): Promise<BidDraftEntity> {
    return this.bidDraftsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a bid draft',
  })
  @ApiParam({
    name: 'id',
    description: 'Bid draft UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Bid draft deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Bid draft not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.bidDraftsService.remove(id);
  }
}
