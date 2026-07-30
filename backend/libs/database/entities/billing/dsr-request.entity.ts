import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dsr_requests')
export class DsrRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
