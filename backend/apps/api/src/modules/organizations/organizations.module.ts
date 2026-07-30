import { Module } from '@nestjs/common';

import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { MsmeProfileController } from './msme-profile.controller';
import { MsmeProfileService } from './msme-profile.service';
import { CertificationsController } from './certifications.controller';
import { CertificationsService } from './certifications.service';

@Module({
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
})
export class OrganizationsModule {}
