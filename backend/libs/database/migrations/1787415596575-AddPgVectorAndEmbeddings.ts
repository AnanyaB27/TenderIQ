import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPgVectorAndEmbeddings1787415596575 implements MigrationInterface {
    name = 'AddPgVectorAndEmbeddings1787415596575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable pgvector extension securely
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
        
        // Add the embedding column with a strict 768 dimension (Gemini embedding model size)
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" ADD COLUMN IF NOT EXISTS "embedding" vector(768)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tender_document_chunks" DROP COLUMN "embedding"`);
        // We intentionally do not DROP EXTENSION vector here to prevent data loss across other potential vector tables
    }
}