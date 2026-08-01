import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
  VerifyCallback,
} from 'passport-google-oauth20';

interface GoogleOAuthUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string | null;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>(
        'GOOGLE_CLIENT_SECRET',
      ),
      callbackURL: configService.getOrThrow<string>(
        'GOOGLE_CALLBACK_URL',
      ),
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const user: GoogleOAuthUser = {
      email: profile.emails?.[0]?.value?.toLowerCase() ?? '',
      firstName: profile.name?.givenName ?? '',
      lastName: profile.name?.familyName ?? '',
      picture: profile.photos?.[0]?.value ?? null,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}