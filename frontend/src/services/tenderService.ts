
export interface Tender {
  id: string;
  title: string;
  referenceNumber?: string;
  description?: string;
  issuingAuthority: string;
  procurementCategory?: string;
  submissionDeadline: string;
  estimatedValue: number;
  status: string;
  hasDocument?: boolean;
  documentUrl?: string;
  documentId?: string;
  extractionStatus?: string;
  extractionError?: string;
  pageCount?: number;
  documentSummary?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface EvaluationResult {
  tenderId: string;
  organizationId: string;
  matchScore: number;
  eligibilityStatus: string;
  summary: string;
  gaps: string[];
  recommendations: string[];
}

const API_BASE_URL = 'http://localhost:4000';

const getAuthHeaders = (isFormData = false): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export async function fetchTenders(): Promise<Tender[]> {
  try {
    const orgId = localStorage.getItem('activeOrganizationId');
    const url = new URL(`${API_BASE_URL}/tenders`);

    if (orgId) {
      url.searchParams.set('organizationId', orgId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to fetch tenders from backend.',
      );
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  } catch (error) {
    console.error('Error fetching tenders:', error);
    return [];
  }
}

export async function evaluateTender(
  organizationId: string,
  tenderId: string,
  documentId?: string,
): Promise<EvaluationResult | null> {
  try {
    const url = new URL(
      `${API_BASE_URL}/organizations/${encodeURIComponent(organizationId)}/tenders/${encodeURIComponent(tenderId)}/evaluate`,
    );

    if (documentId) {
      url.searchParams.set('documentId', documentId);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Failed to evaluate tender.',
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error evaluating tender:', error);
    return null;
  }
}

export async function uploadCustomTender(
  file: File,
  title: string,
): Promise<Tender> {
  const organizationId = localStorage.getItem('activeOrganizationId');

  if (!organizationId) {
    throw new Error(
      'Active organization ID not found. Please log in again.',
    );
  }

  if (
    file.type !== 'application/pdf' &&
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    throw new Error('Only PDF files are supported.');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('PDF files must be 15 MB or smaller.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('organizationId', organizationId);
  formData.append('title', title.trim() || file.name);

  const response = await fetch(`${API_BASE_URL}/tenders/upload`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to upload custom tender document.',
    );
  }

  if (!result.id || !result.documentId) {
    throw new Error(
      'Upload response is missing the tender ID or document ID.',
    );
  }

  return result as Tender;
}
