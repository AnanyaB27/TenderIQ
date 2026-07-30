import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tender_field_corrections')
export class TenderFieldCorrectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
