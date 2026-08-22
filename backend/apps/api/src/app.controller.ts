import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return { status: 'ok', message: 'TenderIQ API is online' };
  }
}