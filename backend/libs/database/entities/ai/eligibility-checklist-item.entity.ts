import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eligibility_checklist_items')
export class EligibilityChecklistItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
