import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationEntity } from '@app/database/entities/identity/organization.entity';
import { OrganizationMemberEntity } from '@app/database/entities/identity/organization-member.entity';
import { OrganizationInvitationEntity } from '@app/database/entities/identity/organization-invitation.entity';
import { MsmeProfileEntity } from '@app/database/entities/identity/msme-profile.entity';

import { OrganizationsController } from './organizations.controller';
import { MembersController } from './members.controller';
import { InvitationsController } from './invitations.controller';
import { MsmeProfileController } from './msme-profile.controller';

import { OrganizationsService } from './organizations.service';
import { MembersService } from './members.service';
import { InvitationsService } from './invitations.service';
import { MsmeProfileService } from './msme-profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationEntity,
      OrganizationMemberEntity,
      OrganizationInvitationEntity,
      MsmeProfileEntity,
    ]),
  ],
  controllers: [
    OrganizationsController,
    MembersController,
    InvitationsController,
    MsmeProfileController,
  ],
  providers: [
    OrganizationsService,
    MembersService,
    InvitationsService,
    MsmeProfileService,
  ],
  exports: [
    OrganizationsService,
    MembersService,
    InvitationsService,
    MsmeProfileService,
  ],
})
export class OrganizationsModule {}