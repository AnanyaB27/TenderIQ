import { PartialType } from '@nestjs/swagger';
import { CreateTenderDocumentDto } from './create-tender-document.dto';

export class UpdateTenderDocumentDto extends PartialType(CreateTenderDocumentDto) {}