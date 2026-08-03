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

import { ChecklistTaskEntity } from '@app/database/entities/pipeline/checklist-task.entity';

import {
  CreateChecklistTaskDto,
  UpdateChecklistTaskDto,
} from './dto';
import { ChecklistTasksService } from './checklist-tasks.service';

@ApiTags('Checklist Tasks')
@Controller('checklist-tasks')
export class ChecklistTasksController {
  constructor(
    private readonly checklistTasksService: ChecklistTasksService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new checklist task',
  })
  @ApiResponse({
    status: 201,
    description: 'Checklist task created successfully.',
    type: ChecklistTaskEntity,
  })
  create(
    @Body() dto: CreateChecklistTaskDto,
  ): Promise<ChecklistTaskEntity> {
    return this.checklistTasksService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all checklist tasks',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist tasks retrieved successfully.',
    type: [ChecklistTaskEntity],
  })
  findAll(): Promise<ChecklistTaskEntity[]> {
    return this.checklistTasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a checklist task by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Checklist task UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist task retrieved successfully.',
    type: ChecklistTaskEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist task not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ChecklistTaskEntity> {
    return this.checklistTasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a checklist task',
  })
  @ApiParam({
    name: 'id',
    description: 'Checklist task UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist task updated successfully.',
    type: ChecklistTaskEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist task not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChecklistTaskDto,
  ): Promise<ChecklistTaskEntity> {
    return this.checklistTasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a checklist task',
  })
  @ApiParam({
    name: 'id',
    description: 'Checklist task UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist task deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist task not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.checklistTasksService.remove(id);
  }
}
