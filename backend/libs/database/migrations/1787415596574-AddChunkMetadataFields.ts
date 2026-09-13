import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChunkMetadataFields1787415596574 implements MigrationInterface {
    name = 'AddChunkMetadataFields1787415596574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" ADD COLUMN IF NOT EXISTS "chunk_hash" character varying`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" ADD COLUMN IF NOT EXISTS "sequence_number" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" ADD COLUMN IF NOT EXISTS "page_start" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" ADD COLUMN IF NOT EXISTS "page_end" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" ADD COLUMN IF NOT EXISTS "section_heading" character varying`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" ADD COLUMN IF NOT EXISTS "char_count" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" DROP COLUMN "char_count"`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" DROP COLUMN "section_heading"`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" DROP COLUMN "page_end"`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" DROP COLUMN "page_start"`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" DROP COLUMN "sequence_number"`);
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" DROP COLUMN "chunk_hash"`);
    }
}