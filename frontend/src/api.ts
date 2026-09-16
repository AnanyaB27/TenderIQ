// frontend/src/api.ts

const API_BASE_URL = 'http://localhost:4000';

// Centralized auth header generator
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export interface Citation {
  chunk_id: string;
  document_id: string;
  page_start: number;
  page_end: number;
  section_heading?: string | null;
  excerpt: string;
  validation_status: string;
  validation_reason?: string | null;
}

export interface RuleResult {
  rule_id: string;
  requirement_type: string;
  status: 'PASS' | 'FAIL' | 'UNKNOWN';
  requirement_text: string;
  organization_value: string;
  reason: string;
  is_mandatory: boolean;
  evidence: Citation[];
}

export interface EvaluationResult {
  tenderId: string;
  organizationId: string;
  documentId?: string; // <-- Added for P1.4
  matchScore: number;
  eligibilityStatus: string;
  evidenceCoverage: number;
  summary: string;
  gaps: string[];
  recommendations: string[];
  ruleResults: RuleResult[];
}

// <-- Added for P1.4: Fetch historical persisted evaluations -->
export async function getTenderEvaluation(
  organizationId: string, 
  tenderId: string,
  documentId?: string
): Promise<EvaluationResult | null> {
  try {
    const url = new URL(`${API_BASE_URL}/organizations/${organizationId}/tenders/${tenderId}/evaluation`);
    if (documentId) {
      url.searchParams.append('documentId', documentId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 404) return null; // Normal state if not evaluated yet
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stored tender evaluation:', error);
    return null;
  }
}

export async function evaluateTender(
  organizationId: string, 
  tenderId: string, 
  documentId: string,
  dynamicContext?: string
): Promise<EvaluationResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/tenders/${tenderId}/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ documentId, dynamicContext }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to evaluate tender via backend: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error evaluating tender:', error);
    return null;
  }
}

export async function uploadDocument(organizationId: string, file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/documents/extract`, {
      method: 'POST',
      headers, // Pass custom headers (excluding Content-Type so boundary is auto-generated)
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to extract document text via backend: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
}

export async function fetchTendersFromDb(organizationId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/tenders/sync-live`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch tenders from database: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching real tenders:', error);
    return [];
  }
}