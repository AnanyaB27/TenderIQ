import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenderEvaluationsTable1787415596576 implements MigrationInterface {
    name = 'CreateTenderEvaluationsTable1787415596576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the tender_evaluations table with JSONB columns for nested AI outputs
        await queryRunner.query(`
            CREATE TABLE "tender_evaluations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "organizationId" uuid NOT NULL,
                "tenderId" uuid NOT NULL,
                "documentId" uuid NOT NULL,
                "matchScore" integer NOT NULL,
                "eligibilityStatus" character varying(50) NOT NULL,
                "evidenceCoverage" double precision NOT NULL DEFAULT '0',
                "summary" text NOT NULL,
                "gaps" jsonb NOT NULL DEFAULT '[]',
                "recommendations" jsonb NOT NULL DEFAULT '[]',
                "ruleResults" jsonb NOT NULL DEFAULT '[]',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_org_tender_doc" UNIQUE ("organizationId", "tenderId", "documentId"),
                CONSTRAINT "PK_tender_evaluations" PRIMARY KEY ("id")
            )
        `);

        // Create the composite index for fast dashboard lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_org_tender" ON "tender_evaluations" ("organizationId", "tenderId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reversible down migration
        await queryRunner.query(`DROP INDEX "public"."IDX_org_tender"`);
        await queryRunner.query(`DROP TABLE "tender_evaluations"`);
    }
}