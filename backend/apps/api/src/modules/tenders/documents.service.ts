import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenderDocumentEntity } from '@app/database/entities/tender/tender-document.entity';

import {
  CreateTenderDocumentDto,
  UpdateTenderDocumentDto,
} from './dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(TenderDocumentEntity)
    private readonly documentRepository: Repository<TenderDocumentEntity>,
  ) {}

  async create(
    dto: CreateTenderDocumentDto,
  ): Promise<TenderDocumentEntity> {
    const document = this.documentRepository.create(dto);

    return this.documentRepository.save(document);
  }

  async findAll(): Promise<TenderDocumentEntity[]> {
    return this.documentRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TenderDocumentEntity> {
    const document = await this.documentRepository.findOneBy({
      id,
    });

    if (!document) {
      throw new NotFoundException(
        `Tender document with ID '${id}' was not found.`,
      );
    }

    return document;
  }

  async update(
    id: string,
    dto: UpdateTenderDocumentDto,
  ): Promise<TenderDocumentEntity> {
    const document = await this.findOne(id);

    this.documentRepository.merge(document, dto);

    return this.documentRepository.save(document);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.documentRepository.delete(id);

    return {
      success: true,
      message: 'Tender document deleted successfully.',
    };
  }
}
