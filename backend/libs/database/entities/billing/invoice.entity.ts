import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('invoices')
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
