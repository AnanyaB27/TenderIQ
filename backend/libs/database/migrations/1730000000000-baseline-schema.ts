import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Placeholder for the initial migration creating the full DATABASE.md v1.1
 * schema (all 33 tables, indexes, and constraints). Generated from the
 * entities in libs/database/entities in a later phase via
 * `typeorm migration:generate`.
 */
export class BaselineSchema1730000000000 implements MigrationInterface {
  name = 'BaselineSchema1730000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Implemented in a later phase.
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Implemented in a later phase.
  }
}
