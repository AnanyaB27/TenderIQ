import { Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiGatewayService } from './ai-gateway.service';

@ApiTags('AI Intelligence')
@Controller('organizations/:organizationId/tenders/:tenderId')
export class AiController {
  constructor(private readonly aiGatewayService: AiGatewayService) {}

  @Post('evaluate')
  @ApiOperation({
    summary: 'Evaluate organization eligibility and gap analysis for a specific tender',
  })
  @ApiParam({ name: 'organizationId', description: 'Organization UUID' })
  @ApiParam({ name: 'tenderId', description: 'Tender UUID' })
  @ApiResponse({
    status: 200,
    description: 'AI evaluation generated successfully.',
  })
  async evaluateTender(
    @Param('organizationId') organizationId: string,
    @Param('tenderId') tenderId: string,
  ) {
    // You can later wire this up to this.aiGatewayService to run real LLM / semantic evaluations
    return {
      tenderId,
      organizationId,
      matchScore: 96,
      eligibilityStatus: 'High Match',
      summary: 'The organization meets core technical competencies in IoT & embedded systems.',
      gaps: [
        'Requires certified proof of prior government project execution exceeding ₹50,00,000.',
        'Compliance documentation for ISO/IEC 27001 must be attached.'
      ],
      recommendations: [
        'Include your VaultofCodes e-commerce project case study as a modular reference.',
        'Upload your MSME registration certificate to claim preference points.'
      ]
    };
  }
}