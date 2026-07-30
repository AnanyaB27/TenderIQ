import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Resolves organization role from the authenticated session, never from the
 * `organizationId` path param alone (Architecture.md §13.3). Real resolution
 * logic is implemented in a later phase.
 */
@Injectable()
export class OrganizationMembershipGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
