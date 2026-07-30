import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('saved_searches')
export class SavedSearchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
