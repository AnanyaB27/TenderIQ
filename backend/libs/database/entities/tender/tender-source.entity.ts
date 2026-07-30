import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tender_sources')
export class TenderSourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
