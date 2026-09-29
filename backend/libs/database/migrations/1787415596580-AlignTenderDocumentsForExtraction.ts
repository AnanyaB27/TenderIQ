import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignTenderDocumentsForExtraction1787415596580
  implements MigrationInterface
{
  name = 'AlignTenderDocumentsForExtraction1787415596580';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ADD COLUMN IF NOT EXISTS "organization_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ALTER COLUMN "tender_id" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ALTER COLUMN "stored_file_name" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ALTER COLUMN "file_path" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ALTER COLUMN "original_file_name" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ALTER COLUMN "original_file_name" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ALTER COLUMN "file_path" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ALTER COLUMN "stored_file_name" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      ALTER COLUMN "tender_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tender_documents"
      DROP COLUMN IF EXISTS "organization_id"
    `);
  }
}
