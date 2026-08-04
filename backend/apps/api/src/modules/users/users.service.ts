import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@app/database/entities/identity/user.entity';

import {
  CreateUserDto,
  UpdateUserDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    dto: CreateUserDto,
  ): Promise<UserEntity> {
    const user = this.userRepository.create(dto);

    return this.userRepository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID '${id}' was not found.`,
      );
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findOne(id);

    this.userRepository.merge(user, dto);

    return this.userRepository.save(user);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.userRepository.delete(id);

    return {
      success: true,
      message: 'User deleted successfully.',
    };
  }
}
