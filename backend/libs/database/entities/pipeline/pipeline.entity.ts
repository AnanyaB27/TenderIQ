import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bidding_pipeline')
export class PipelineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  tenderId: string;

  @Column()
  tenderTitle: string;

  @Column({ nullable: true })
  issuingAuthority: string;

  @Column({ type: 'decimal', nullable: true })
  estimatedValue: number;

  @Column({ default: 'Drafting' })
  status: string; // 'Drafting', 'Submitted', 'Won', 'Lost'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}