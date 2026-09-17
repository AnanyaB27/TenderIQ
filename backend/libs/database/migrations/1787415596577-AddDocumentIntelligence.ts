import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentIntelligence1787415596577 implements MigrationInterface {
    name = 'AddDocumentIntelligence1787415596577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tender_documents" ADD "documentSummary" text`);
        await queryRunner.query(`ALTER TABLE "tender_documents" ADD "extractedMetadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN "extractedMetadata"`);
        await queryRunner.query(`ALTER TABLE "tender_documents" DROP COLUMN "documentSummary"`);
    }
}