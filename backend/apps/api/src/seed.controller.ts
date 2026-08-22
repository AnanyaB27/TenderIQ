import { Controller, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrganizationEntity } from '@app/database/entities/identity/organization.entity';
import { TenderEntity, TenderType, TenderStatus } from '@app/database/entities/tender/tender.entity';

@Controller('seed')
export class SeedController {
  constructor(private readonly dataSource: DataSource) {}

  @Post()
  async seedData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create a test Organization
      const org = new OrganizationEntity();
      org.name = 'VaultOfCodes Solutions'; // Placeholder name
      org.isActive = true;
      const savedOrg = await queryRunner.manager.save(org);

      // 2. Insert the IoT Wildlife Camera Tender
      const tender1 = new TenderEntity();
      tender1.organizationId = savedOrg.id;
      tender1.title = 'Supply & Installation of IoT Wildlife Monitoring Cameras';
      tender1.referenceNumber = 'TEND-2026-089';
      tender1.issuingAuthority = 'Ministry of Environment & Forests';
      tender1.procurementCategory = 'IoT & Embedded Systems';
      tender1.estimatedValue = 4500000;
      tender1.tenderType = TenderType.OPEN;
      tender1.status = TenderStatus.PUBLISHED;
      await queryRunner.manager.save(tender1);

      // 3. Insert the Laser Fencing Tender
      const tender2 = new TenderEntity();
      tender2.organizationId = savedOrg.id;
      tender2.title = 'Automated Laser Fencing & Perimeter Security Deployment';
      tender2.referenceNumber = 'TEND-2026-112';
      tender2.issuingAuthority = 'Defense Research and Development';
      tender2.procurementCategory = 'Hardware & Defense';
      tender2.estimatedValue = 8500000;
      tender2.tenderType = TenderType.OPEN;
      tender2.status = TenderStatus.PUBLISHED;
      await queryRunner.manager.save(tender2);

      await queryRunner.commitTransaction();
      return { message: 'Database successfully seeded!', organizationId: savedOrg.id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}