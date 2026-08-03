import { PartialType } from '@nestjs/swagger';
import { CreateDsrRequestDto } from './create-dsr-request.dto';

export class UpdateDsrRequestDto extends PartialType(CreateDsrRequestDto) {}
