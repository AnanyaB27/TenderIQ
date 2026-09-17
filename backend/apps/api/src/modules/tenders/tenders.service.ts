import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenderEntity } from '@app/database/entities/tender/tender.entity';
import { GetTendersDto } from './dto/get-tenders.dto';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(TenderEntity)
    private readonly tenderRepo: Repository<TenderEntity>,
  ) {}

  async findAll(query: GetTendersDto) {
    const { 
      search, category, authority, 
      sortBy = 'createdAt', sortOrder = 'DESC', 
      page = 1, limit = 10 
    } = query;

    const qb = this.tenderRepo.createQueryBuilder('tender');

    // Deterministic Text Search (Parameterized to prevent SQL injection)
    if (search) {
      qb.andWhere(
        '(tender.title ILIKE :search OR tender.referenceNumber ILIKE :search OR tender.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Exact Match Filters
    if (category) {
      qb.andWhere('tender.procurementCategory = :category', { category });
    }
    if (authority) {
      qb.andWhere('tender.issuingAuthority = :authority', { authority });
    }

    // Whitelisted sorting to prevent arbitrary column execution
    const allowedSortColumns = ['title', 'estimatedValue', 'createdAt', 'submissionDeadline'];
    const actualSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    
    qb.orderBy(`tender.${actualSortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<TenderEntity> {
    const tender = await this.tenderRepo.findOne({ where: { id } });
    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found.`);
    }
    return tender;
  }
}