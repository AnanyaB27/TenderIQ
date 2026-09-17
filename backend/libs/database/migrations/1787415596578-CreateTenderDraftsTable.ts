import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenderDraftsTable1787415596578 implements MigrationInterface {
    name = 'CreateTenderDraftsTable1787415596578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tender_drafts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "organizationId" uuid NOT NULL,
                "tenderId" uuid NOT NULL,
                "documentId" uuid NOT NULL,
                "draftType" character varying(100) NOT NULL,
                "content" text NOT NULL,
                "usedSources" jsonb NOT NULL DEFAULT '[]',
                "missingInformation" jsonb NOT NULL DEFAULT '[]',
                "warnings" jsonb NOT NULL DEFAULT '[]',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_org_tender_doc_type" UNIQUE ("organizationId", "tenderId", "documentId", "draftType"),
                CONSTRAINT "PK_tender_drafts" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tender_drafts"`);
    }
}