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