import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('msme_certifications')
export class MsmeCertificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
