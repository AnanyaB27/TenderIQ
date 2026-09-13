import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentExtractionFields1787415596573 implements MigrationInterface {
    name = 'AddDocumentExtractionFields1787415596573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "file_size" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "page_count" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "extraction_status" character varying NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "tender_documents" ADD COLUMN IF NOT EXISTS "extracted_text" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN "extracted_text"`);
        await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN "extraction_status"`);
        await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN "page_count"`);
        await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN "file_size"`);
    }
}