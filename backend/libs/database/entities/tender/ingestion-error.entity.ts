import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ingestion_errors')
export class IngestionErrorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
