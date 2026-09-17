import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConfidenceMetadata1787415596579 implements MigrationInterface {
    name = 'AddConfidenceMetadata1787415596579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add JSONB columns for deterministic confidence and risk flags
        await queryRunner.query(`ALTER TABLE "tender_evaluations" ADD "confidenceMetadata" jsonb`);
        await queryRunner.query(`ALTER TABLE "tender_evaluations" ADD "riskFlags" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Safe, reversible down migration
        await queryRunner.query(`ALTER TABLE "tender_evaluations" DROP COLUMN "riskFlags"`);
        await queryRunner.query(`ALTER TABLE "tender_evaluations" DROP COLUMN "confidenceMetadata"`);
    }
}