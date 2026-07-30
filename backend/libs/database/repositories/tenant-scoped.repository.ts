import { Repository, ObjectLiteral } from 'typeorm';

/**
 * Base class injecting the mandatory organization_id predicate
 * (Architecture.md §9.4, §13.3). Every repository touching an
 * organization-scoped table extends this class; the actual predicate
 * injection is implemented in a later phase.
 */
export abstract class TenantScopedRepository<Entity extends ObjectLiteral> extends Repository<Entity> {}
