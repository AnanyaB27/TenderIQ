import { Module } from '@nestjs/common';

import { AiController } from './ai.controller';
import { AiGatewayService } from './ai-gateway.service';
import { AiCreditGuardService } from './ai-credit-guard.service';
import { DraftSectionsController } from './draft-sections.controller';

@Module({
  controllers: [AiController, DraftSectionsController],
  providers: [AiGatewayService, AiCreditGuardService],
})
export class AiModule {}
