import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignTenderDocumentsEntity1787415596581 implements MigrationInterface {
  name = 'AlignTenderDocumentsEntity1787415596581';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "organizationId" uuid`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "fileName" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "fileType" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "fileSize" integer DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "extractionStatus" varchar(50) DEFAULT 'PROCESSING'`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "pageCount" integer DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "extractedText" text`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "documentSummary" text`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "extractedMetadata" jsonb`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "uploadedAt" timestamptz DEFAULT NOW()`);
    await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT NOW()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "uploadedAt"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "extractedMetadata"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "documentSummary"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "extractedText"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "pageCount"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "extractionStatus"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "fileSize"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "fileType"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "fileName"`);
    await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN IF EXISTS "organizationId"`);
  }
}
