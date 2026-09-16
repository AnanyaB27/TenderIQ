import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrganizationMemberEntity } from '@app/database/entities/identity/organization-member.entity';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class OrganizationMembershipGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;
    
    if (!user || !user.userId) {
      throw new UnauthorizedException('Valid authentication token is required.');
    }

    const orgId = request.params.orgId || request.body.organizationId || request.query.organizationId;
    
    if (!orgId) {
      return true; 
    }

    const memberRepo = this.dataSource.getRepository(OrganizationMemberEntity);
    const membership = await memberRepo.findOne({
      where: { 
        userId: user.userId, 
        organizationId: orgId, 
        isActive: true 
      }
    });

    if (!membership) {
      throw new ForbiddenException(`Access Denied: You do not have active membership in organization '${orgId}'.`);
    }

    request.membership = membership;
    return true;
  }
}