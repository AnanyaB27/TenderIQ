import { PartialType } from '@nestjs/swagger';
import { CreateMsmeProfileDto } from './create-msme-profile.dto';

export class UpdateMsmeProfileDto extends PartialType(CreateMsmeProfileDto) {}