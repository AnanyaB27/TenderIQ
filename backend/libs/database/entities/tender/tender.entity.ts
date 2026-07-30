import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tenders')
export class TenderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
