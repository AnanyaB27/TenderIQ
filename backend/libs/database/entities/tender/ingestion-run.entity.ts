import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ingestion_runs')
export class IngestionRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
