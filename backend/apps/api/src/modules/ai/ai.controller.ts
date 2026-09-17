import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../libs/common/guards/jwt-auth.guard';
import { OrganizationMembershipGuard } from '../../../../../libs/common/guards/organization-membership.guard';

/**
 * P1.12 STABILIZATION:
 * Obsolete mock evaluation routes have been removed from this controller.
 * The canonical, end-to-end evaluation flow (PDF -> FastAPI -> pgvector -> Gemini -> Deterministic RuleEngine)
 * is now exclusively managed by `evaluation.controller.ts` to prevent competing production paths.
 */
@UseGuards(JwtAuthGuard, OrganizationMembershipGuard)
@Controller('organizations/:orgId/ai')
export class AiController {
  // Reserved for future non-evaluation AI utilities (e.g., generic chatbots, standalone OCR tasks).
}