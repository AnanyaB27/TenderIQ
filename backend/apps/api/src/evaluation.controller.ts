import { Controller, Post, Param } from '@nestjs/common';

@Controller('organizations/:orgId/tenders')
export class EvaluationController {
  
  @Post(':tenderId/evaluate')
  evaluateTender(
    @Param('orgId') orgId: string, 
    @Param('tenderId') tenderId: string
  ) {
    // Returning mock AI data for now to test the frontend connection
    return {
      tenderId: tenderId,
      organizationId: orgId,
      matchScore: 88,
      eligibilityStatus: 'Highly Eligible',
      summary: 'Strong match based on technical capabilities and project history.',
      gaps: ['Requires valid ISO 9001 certification proof in the final bid'],
      recommendations: [
        'Highlight previous successful hardware deployments.',
        'Emphasize edge-computing performance metrics.'
      ]
    };
  }
}