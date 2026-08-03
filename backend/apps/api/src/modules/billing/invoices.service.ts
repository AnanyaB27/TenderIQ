import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvoiceEntity } from '@app/database/entities/billing/invoice.entity';

import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from './dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

  async create(
    dto: CreateInvoiceDto,
  ): Promise<InvoiceEntity> {
    const invoice = this.invoiceRepository.create(dto);

    return this.invoiceRepository.save(invoice);
  }

  async findAll(): Promise<InvoiceEntity[]> {
    return this.invoiceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOneBy({
      id,
    });

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID '${id}' was not found.`,
      );
    }

    return invoice;
  }

  async update(
    id: string,
    dto: UpdateInvoiceDto,
  ): Promise<InvoiceEntity> {
    const invoice = await this.findOne(id);

    this.invoiceRepository.merge(invoice, dto);

    return this.invoiceRepository.save(invoice);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.invoiceRepository.delete(id);

    return {
      success: true,
      message: 'Invoice deleted successfully.',
    };
  }
}
