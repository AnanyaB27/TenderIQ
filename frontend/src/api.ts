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

export interface Tender {
  id: string;
  referenceNumber: string;
  title: string;
  issuingAuthority: string;
  estimatedValue?: number;
  procurementCategory?: string;
  description?: string;
  createdAt: string;
}

export interface GetTendersParams {
  search?: string;
  category?: string;
  authority?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface PaginatedTenders {
  items: Tender[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getTenders(params: GetTendersParams): Promise<PaginatedTenders | null> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/tenders?${query.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching tenders:', error);
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

// P1.9 Updated Document Upload Result Interface
export interface DocumentUploadResult {
  id: string;
  filename: string;
  status: string;
  pageCount: number;
  documentSummary?: string | null;
  metadata?: {
    eligibility_highlights?: string[];
    procurement_type?: string;
  } | null;
  message?: string;
}

export async function uploadDocument(organizationId: string, file: File): Promise<DocumentUploadResult | null> {
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

export interface MsmeProfile {
  id?: string;
  organizationId: string;
  turnoverInCrores: number;
  yearsOfExperience: number;
  operatingLocations: string[];
  coreCapabilities: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  validUntil: string;
}

export async function getMsmeProfile(organizationId: string): Promise<MsmeProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/msme-profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching MSME profile:', error);
    return null;
  }
}

export async function updateMsmeProfile(organizationId: string, profile: Partial<MsmeProfile>): Promise<MsmeProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/msme-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating MSME profile:', error);
    return null;
  }
}

// --- NEW P1.10 BID DRAFTING API ---
export interface DraftResult {
  id: string;
  draftType: string;
  content: string;
  usedSources: string[];
  missingInformation: string[];
  warnings: string[];
  updatedAt: string;
}

export async function generateBidDraft(
  organizationId: string, tenderId: string, documentId: string, draftType: string
): Promise<DraftResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/tenders/${tenderId}/drafts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ documentId, draftType })
    });
    if (!response.ok) throw new Error('Failed to generate draft');
    return await response.json();
  } catch (err) {
    console.error('Error generating bid draft:', err);
    return null;
  }
}

export async function getBidDrafts(
  organizationId: string, tenderId: string, documentId: string
): Promise<DraftResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/tenders/${tenderId}/drafts?documentId=${documentId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Error fetching bid drafts:', err);
    return [];
  }
}