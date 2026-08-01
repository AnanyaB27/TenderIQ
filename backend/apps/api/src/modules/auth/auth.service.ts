import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';

import { UserEntity } from '../../../../../libs/database/entities/identity/user.entity';
import { UserOauthIdentityEntity } from '../../../../../libs/database/entities/identity/user-oauth-identity.entity';
import { AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserOauthIdentityEntity)
    private readonly oauthIdentityRepository: Repository<UserOauthIdentityEntity>,

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
        where: {
          email: normalizedEmail,
        },
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