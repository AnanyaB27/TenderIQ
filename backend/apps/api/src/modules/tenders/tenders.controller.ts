import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TendersService } from './tenders.service';
import { GetTendersDto } from './dto/get-tenders.dto';
import { JwtAuthGuard } from '../../../../../libs/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get()
  async getTenders(@Query() query: GetTendersDto) {
    return this.tendersService.findAll(query);
  }

  @Get(':id')
  async getTenderById(@Param('id') id: string) {
    return this.tendersService.findOne(id);
  }
}