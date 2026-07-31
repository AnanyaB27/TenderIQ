import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';
import { UserEntity } from '../../../../../libs/database/entities/identity/user.entity';
import { UserOauthIdentityEntity } from '../../../../../libs/database/entities/identity/user-oauth-identity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserOauthIdentityEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      }),
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleOauthStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}