import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Root health check for frontend status badge' })
  checkRoot() {
    return { status: 'ok', message: 'TenderIQ API is online' };
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check endpoint' })
  checkHealth() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('healthz')
  @ApiOperation({ summary: 'Frontend status check endpoint' })
  checkHealthz() {
    return { status: 'ok' };
  }
}