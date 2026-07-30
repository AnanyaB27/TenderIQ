import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('checklist_tasks')
export class ChecklistTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
