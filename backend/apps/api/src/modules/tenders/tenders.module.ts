import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenderCategoryEntity } from '@app/database/entities/tender/tender-category.entity';
import { TenderEntity } from '@app/database/entities/tender/tender.entity';
import { TenderDocumentEntity } from '@app/database/entities/tender/tender-document.entity';
import { TenderSourceEntity } from '@app/database/entities/tender/tender-source.entity';
import { TenderCategoryLinkEntity } from '@app/database/entities/tender/tender-category-link.entity';
import { TenderFieldCorrectionEntity } from '@app/database/entities/tender/tender-field-correction.entity';

import { CategoriesController } from './categories.controller';
import { TendersController } from './tenders.controller';
import { DocumentsController } from './documents.controller';
import { SourcesController } from './sources.controller';
import { CategoryLinksController } from './category-links.controller';
import { FieldCorrectionsController } from './field-corrections.controller';

import { CategoriesService } from './categories.service';
import { TendersService } from './tenders.service';
import { DocumentsService } from './documents.service';
import { SourcesService } from './sources.service';
import { CategoryLinksService } from './category-links.service';
import { FieldCorrectionsService } from './field-corrections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenderEntity,
      TenderCategoryEntity,
      TenderDocumentEntity,
      TenderSourceEntity,
      TenderCategoryLinkEntity,
      TenderFieldCorrectionEntity,
    ]),
  ],
  controllers: [
    TendersController,
    CategoriesController,
    DocumentsController,
    SourcesController,
    CategoryLinksController,
    FieldCorrectionsController,
  ],
  providers: [
    TendersService,
    CategoriesService,
    DocumentsService,
    SourcesService,
    CategoryLinksService,
    FieldCorrectionsService,
  ],
  exports: [
    TendersService,
    CategoriesService,
    DocumentsService,
    SourcesService,
    CategoryLinksService,
    FieldCorrectionsService,
  ],
})
export class TendersModule {}
