import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bid_drafts')
export class BidDraftEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
