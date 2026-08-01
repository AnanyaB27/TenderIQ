import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenderCategoryEntity } from '@app/database/entities/tender/tender-category.entity';
import { TenderEntity } from '@app/database/entities/tender/tender.entity';

import { CategoriesController } from './categories.controller';
import { TendersController } from './tenders.controller';

import { CategoriesService } from './categories.service';
import { TendersService } from './tenders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenderEntity,
      TenderCategoryEntity,
    ]),
  ],
  controllers: [
    TendersController,
    CategoriesController,
  ],
  providers: [
    TendersService,
    CategoriesService,
  ],
  exports: [
    TendersService,
    CategoriesService,
  ],
})
export class TendersModule {}