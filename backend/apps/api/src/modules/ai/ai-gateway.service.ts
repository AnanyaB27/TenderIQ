import { Injectable, InternalServerErrorException, BadGatewayException } from '@nestjs/common';

export interface MatchEvaluationRequest {
  tender_id: string;
  tender_title: string;
  tender_description: string;
  org_capabilities: string;
  dynamic_context?: string | null;
}

export interface MatchEvaluationResponse {
  tenderId: string;
  organizationId: string;
  matchScore: number;
  eligibilityStatus: string;
  summary: string;
  gaps: string[];
  recommendations: string[];
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

  async extractDocumentText(fileBuffer: Buffer, mimetype: string, originalname: string): Promise<any> {
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

      return await response.json();
    } catch (error) {
      console.error('AiGatewayService - Document Extraction Error:', error);
      if (error instanceof BadGatewayException) throw error;
      throw new InternalServerErrorException('Document parsing failed');
    }
  }
}