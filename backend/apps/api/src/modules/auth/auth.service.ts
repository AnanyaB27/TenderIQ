import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../../../../../libs/database/entities/identity/user.entity';
import {
  OrganizationEntity,
} from '../../../../../libs/database/entities/identity/organization.entity';
import {
  OrganizationMemberEntity,
  OrganizationRole,
} from '../../../../../libs/database/entities/identity/organization-member.entity';
import { UserOauthIdentityEntity } from '../../../../../libs/database/entities/identity/user-oauth-identity.entity';
import { MsmeProfileEntity } from '../../../../../libs/database/entities/identity/msme-profile.entity';
import { AuthResponseDto, RegisterLocalDto, LoginLocalDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserOauthIdentityEntity)
    private readonly oauthIdentityRepository: Repository<UserOauthIdentityEntity>,

    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,

    @InjectRepository(OrganizationMemberEntity)
    private readonly memberRepository: Repository<OrganizationMemberEntity>,

    @InjectRepository(MsmeProfileEntity)
    private readonly profileRepository: Repository<MsmeProfileEntity>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async loginWithGoogle(idToken: string): Promise<AuthResponseDto> {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();

      if (!payload?.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      if (!payload.email_verified) {
        throw new UnauthorizedException('Google email is not verified');
      }

      const {
        sub: providerId,
        email,
        given_name: firstName,
        family_name: lastName,
        picture: avatarUrl,
      } = payload;

      const normalizedEmail = email.toLowerCase();

      let user = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (!user) {
        user = this.userRepository.create({
          email: normalizedEmail,
          firstName: firstName ?? '',
          lastName: lastName ?? '',
          avatarUrl: avatarUrl ?? null,
          isActive: true,
          lastLoginAt: new Date(),
        });

        user = await this.userRepository.save(user);
      } else {
        user.lastLoginAt = new Date();

        if (avatarUrl) {
          user.avatarUrl = avatarUrl;
        }

        user = await this.userRepository.save(user);
      }

      let oauthIdentity = await this.oauthIdentityRepository.findOne({
        where: {
          provider: 'google',
          providerId,
        },
      });

      if (!oauthIdentity) {
        oauthIdentity = this.oauthIdentityRepository.create({
          user,
          provider: 'google',
          providerId,
          profileData: payload as unknown as Record<string, unknown>,
        });

        await this.oauthIdentityRepository.save(oauthIdentity);
      }

      return this.generateAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired Google token');
    }
  }

  async loginLocalDemo(): Promise<AuthResponseDto> {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException('Local demo login is disabled in production.');
    }

    const email = 'demo@tenderiq.local';

    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      user = this.userRepository.create({
        email,
        firstName: 'TenderIQ',
        lastName: 'Demo User',
        avatarUrl: null,
        isActive: true,
        lastLoginAt: new Date(),
      });
    } else {
      user.isActive = true;
      user.lastLoginAt = new Date();
    }

    user = await this.userRepository.save(user);

    let organization = await this.organizationRepository.findOne({
      where: { name: 'VaultOfCodes Solutions' },
    });

    if (!organization) {
      organization = this.organizationRepository.create({
        name: 'VaultOfCodes Solutions',
        isActive: true,
      });
      organization = await this.organizationRepository.save(organization);
    }

    let membership = await this.memberRepository.findOne({
      where: {
        organizationId: organization.id,
        userId: user.id,
      },
    });

    if (!membership) {
      membership = this.memberRepository.create({
        organizationId: organization.id,
        userId: user.id,
        role: OrganizationRole.OWNER,
        isActive: true,
      });
      await this.memberRepository.save(membership);
    } else if (!membership.isActive || membership.role !== OrganizationRole.OWNER) {
      membership.isActive = true;
      membership.role = OrganizationRole.OWNER;
      await this.memberRepository.save(membership);
    }

    const response = this.generateAuthResponse(user);
    response.organization = {
      id: organization.id,
      name: organization.name,
    };

    return response;
  }

  async registerLocal(dto: RegisterLocalDto): Promise<AuthResponseDto> {
    const normalizedEmail = dto.email.toLowerCase();

    const existingUser = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new ForbiddenException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let user = this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: true,
      lastLoginAt: new Date(),
    });
    user = await this.userRepository.save(user);

    let organization = this.organizationRepository.create({
      name: dto.companyName,
      isActive: true,
    });
    organization = await this.organizationRepository.save(organization);

    const membership = this.memberRepository.create({
      organizationId: organization.id,
      userId: user.id,
      role: OrganizationRole.OWNER,
      isActive: true,
    });
    await this.memberRepository.save(membership);

    const msmeProfile = this.profileRepository.create({
      organizationId: organization.id,
    });
    await this.profileRepository.save(msmeProfile);

    const response = this.generateAuthResponse(user);
    response.organization = {
      id: organization.id,
      name: organization.name,
    };

    return response;
  }

  async loginLocal(dto: LoginLocalDto): Promise<AuthResponseDto> {
    const normalizedEmail = dto.email.toLowerCase();

    // We must explicitly select the password field because it is set to select: false in the entity
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'avatarUrl', 'isActive'],
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Fetch the user's primary organization
    const membership = await this.memberRepository.findOne({
      where: { userId: user.id, isActive: true },
      relations: ['organization'],
    });

    if (!membership || !membership.organization) {
      throw new ForbiddenException('User is not associated with any active organization.');
    }

    const response = this.generateAuthResponse(user);
    response.organization = {
      id: membership.organization.id,
      name: membership.organization.name,
    };

    return response;
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOneBy({
        id: payload.sub,
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUserById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private generateAuthResponse(user: UserEntity): AuthResponseDto {
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      isActive: user.isActive,
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}