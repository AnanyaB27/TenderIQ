import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationEntity } from '@app/database/entities/identity/organization.entity';
import { OrganizationMemberEntity } from '@app/database/entities/identity/organization-member.entity';
import { OrganizationInvitationEntity } from '@app/database/entities/identity/organization-invitation.entity';
import { MsmeProfileEntity } from '@app/database/entities/identity/msme-profile.entity';
import { MsmeCertificationEntity } from '@app/database/entities/identity/msme-certification.entity';

import { OrganizationsController } from './organizations.controller';
import { MembersController } from './members.controller';
import { InvitationsController } from './invitations.controller';
import { MsmeProfileController } from './msme-profile.controller';
import { CertificationsController } from './certifications.controller';

import { OrganizationsService } from './organizations.service';
import { MembersService } from './members.service';
import { InvitationsService } from './invitations.service';
import { MsmeProfileService } from './msme-profile.service';
import { CertificationsService } from './certifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationEntity,
      OrganizationMemberEntity,
      OrganizationInvitationEntity,
      MsmeProfileEntity,
      MsmeCertificationEntity,
    ]),
  ],
  controllers: [
    OrganizationsController,
    MembersController,
    InvitationsController,
    MsmeProfileController,
    CertificationsController,
  ],
  providers: [
    OrganizationsService,
    MembersService,
    InvitationsService,
    MsmeProfileService,
    CertificationsService,
  ],
  exports: [
    OrganizationsService,
    MembersService,
    InvitationsService,
    MsmeProfileService,
    CertificationsService,
  ],
})
export class OrganizationsModule {}
