import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('msme_profiles')
export class MsmeProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
