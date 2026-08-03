import { PartialType } from '@nestjs/swagger';
import { CreateChecklistTaskDto } from './create-checklist-task.dto';

export class UpdateChecklistTaskDto extends PartialType(CreateChecklistTaskDto) {}
