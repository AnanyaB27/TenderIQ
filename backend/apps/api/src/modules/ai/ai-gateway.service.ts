import { Injectable, InternalServerErrorException, BadGatewayException } from '@nestjs/common';

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
  private readonly AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

  async evaluateTenderMatch(orgId: string, requestPayload: MatchEvaluationRequest): Promise<MatchEvaluationResponse> {
    try {
      const response = await fetch(`${this.AI_ENGINE_URL}/internal/orgs/${orgId}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {
          // Fallback to status text
        }
        throw new BadGatewayException(`AI Engine Error: ${errorMsg}`);
      }

      return await response.json() as MatchEvaluationResponse;
    } catch (error) {
      console.error('AiGatewayService - Failed to evaluate match:', error);
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new InternalServerErrorException('Could not connect to the AI Engine for evaluation.');
    }
  }

  // Keeping return type flexible here as it handles raw extraction data directly from the document parser
  async extractDocumentText(fileBuffer: Buffer, mimetype: string, originalname: string): Promise<Record<string, unknown>> {
    try {
      const formData = new FormData();
      // Wrap the Node Buffer in a Uint8Array to satisfy TypeScript's BlobPart definition
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimetype });
      formData.append('file', blob, originalname);

      const response = await fetch(`${this.AI_ENGINE_URL}/internal/documents/extract-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new BadGatewayException('Failed to extract text from document in AI engine');
      }

      return await response.json() as Record<string, unknown>;
    } catch (error) {
      console.error('AiGatewayService - Document Extraction Error:', error);
      if (error instanceof BadGatewayException) throw error;
      throw new InternalServerErrorException('Document parsing failed');
    }
  }
}