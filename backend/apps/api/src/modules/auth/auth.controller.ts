import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  GoogleLoginDto,
  RefreshTokenDto,
  RegisterLocalDto,
  LoginLocalDto,
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user using Google OAuth',
  })
  @ApiBody({
    type: GoogleLoginDto,
  })
  @ApiOkResponse({
    description: 'Authentication successful.',
    type: AuthResponseDto,
  })
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.loginWithGoogle(googleLoginDto.idToken);
  }

  @Post('local')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Local development demo login',
  })
  @ApiOkResponse({
    description: 'Local demo authentication successful.',
    type: AuthResponseDto,
  })
  async localLogin(): Promise<AuthResponseDto> {
    return this.authService.loginLocalDemo();
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and organization' })
  @ApiBody({ type: RegisterLocalDto })
  async registerLocal(@Body() dto: RegisterLocalDto): Promise<AuthResponseDto> {
    return this.authService.registerLocal(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user using email and password' })
  @ApiBody({ type: LoginLocalDto })
  async loginLocal(@Body() dto: LoginLocalDto): Promise<AuthResponseDto> {
    return this.authService.loginLocal(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh JWT access token',
  })
  @ApiBody({
    type: RefreshTokenDto,
  })
  @ApiOkResponse({
    description: 'Token refreshed successfully.',
    type: AuthResponseDto,
  })
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
} 