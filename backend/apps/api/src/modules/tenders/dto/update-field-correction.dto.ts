import { PartialType } from '@nestjs/swagger';
import { CreateFieldCorrectionDto } from './create-field-correction.dto';

export class UpdateFieldCorrectionDto extends PartialType(CreateFieldCorrectionDto) {}
