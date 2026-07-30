import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tender_categories')
export class TenderCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
