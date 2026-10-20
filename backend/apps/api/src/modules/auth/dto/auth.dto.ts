import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class AuthUserDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  avatarUrl!: string | null;
}

export class AuthOrganizationDto {
  id!: string;
  name!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: AuthUserDto;
  organization?: AuthOrganizationDto;
}

export class RegisterLocalDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  companyName!: string;
}

export class LoginLocalDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}