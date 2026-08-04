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

import { UserEntity } from '@app/database/entities/identity/user.entity';

import {
  CreateUserDto,
  UpdateUserDto,
} from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: UserEntity,
  })
  create(
    @Body() dto: CreateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all users',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
    type: [UserEntity],
  })
  findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a user by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
    type: UserEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.usersService.remove(id);
  }
}
