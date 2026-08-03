import { PartialType } from '@nestjs/swagger';
import { CreateCategoryLinkDto } from './create-category-link.dto';

export class UpdateCategoryLinkDto extends PartialType(CreateCategoryLinkDto) {}
