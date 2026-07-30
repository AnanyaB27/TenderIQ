import { Module } from '@nestjs/common';

import { TendersController } from './tenders.controller';
import { TendersService } from './tenders.service';
import { CategoriesController } from './categories.controller';

@Module({
  controllers: [TendersController, CategoriesController],
  providers: [TendersService],
})
export class TendersModule {}
