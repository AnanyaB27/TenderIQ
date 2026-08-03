import { PartialType } from '@nestjs/swagger';
import { CreateTenderSourceDto } from './create-tender-source.dto';

export class UpdateTenderSourceDto extends PartialType(CreateTenderSourceDto) {}
