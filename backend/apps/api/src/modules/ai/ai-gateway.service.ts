import {
  Injectable,
  InternalServerErrorException,
  BadGatewayException,
} from '@nestjs/common';

export interface MatchEvaluationRequest {
  document_id: string;
  org_profile_text?: string;
}

export interface CitationDto {
  chunk_id: string;
  document_id: string;
  page_start: number;
  page_end: number;
  section_heading?: string | null;
  excerpt: string;
  validation_status: string;
  validation_reason?: string | null;
}

export interface RuleEvaluationDto {
  rule_id: string;
  requirement_type: string;
  status: string;
  requirement_text: string;
  organization_value: string;
  reason: string;
  is_mandatory: boolean;
  evidence: CitationDto[];
}

export interface MatchEvaluationResponse {
  documentId: string;
  organizationId: string;
  matchScore: number;
  eligibilityStatus: string;
  evidenceCoverage: number;
  summary: string;
  gaps: string[];
  recommendations: string[];
  ruleResults: RuleEvaluationDto[];
}

@Injectable()
export class AiGatewayService {
  private readonly AI_ENGINE_URL =
    process.env.AI_ENGINE_URL || 'http://localhost:8000';

  async evaluateTenderMatch(
    orgId: string,
    requestPayload: MatchEvaluationRequest,
  ): Promise<MatchEvaluationResponse> {
    try {
      const response = await fetch(
        `${this.AI_ENGINE_URL}/internal/orgs/${orgId}/match`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();

        console.error(
          `AI Engine evaluation failed: HTTP ${response.status} ${response.statusText}`,
          errorBody,
        );

        throw new BadGatewayException(
          `AI Engine Error (${response.status}): ${errorBody}`,
        );
      }

      return (await response.json()) as MatchEvaluationResponse;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      console.error(
        'AiGatewayService - Evaluation Error:',
        error,
      );

      throw new InternalServerErrorException(
        'Could not connect to the AI Engine for evaluation.',
      );
    }
  }

  async extractDocumentText(
    documentId: string,
    fileBuffer: Buffer,
    mimetype: string,
    originalname: string,
  ): Promise<Record<string, unknown>> {
    try {
      const formData = new FormData();

      formData.append('document_id', documentId);

      const blob = new Blob(
        [new Uint8Array(fileBuffer)],
        { type: mimetype },
      );

      formData.append(
        'file',
        blob,
        originalname,
      );

      const response = await fetch(
        `${this.AI_ENGINE_URL}/internal/documents/extract-text`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();

        console.error(
          `AI Engine document extraction failed: HTTP ${response.status} ${response.statusText}`,
          errorBody,
        );

        throw new BadGatewayException(
          `AI Engine document extraction failed (${response.status}): ${errorBody}`,
        );
      }

      return (await response.json()) as Record<string, unknown>;
    } catch (error) {
      console.error(
        'AiGatewayService - Document Pipeline Error:',
        error,
      );

      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Document parsing and processing failed',
      );
    }
  }
}