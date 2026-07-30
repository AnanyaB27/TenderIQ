import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pipeline_items')
export class PipelineItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
