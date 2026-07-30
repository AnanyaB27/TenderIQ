import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tender_category_links')
export class TenderCategoryLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
