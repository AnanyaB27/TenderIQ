import { PartialType } from '@nestjs/swagger';
import { CreateBidDraftDto } from './create-bid-draft.dto';

export class UpdateBidDraftDto extends PartialType(CreateBidDraftDto) {}
