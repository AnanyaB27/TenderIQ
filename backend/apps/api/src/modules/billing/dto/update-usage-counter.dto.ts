import { PartialType } from '@nestjs/swagger';
import { CreateUsageCounterDto } from './create-usage-counter.dto';

export class UpdateUsageCounterDto extends PartialType(CreateUsageCounterDto) {}
