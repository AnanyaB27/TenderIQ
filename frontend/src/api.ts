// frontend/src/api.ts

const API_BASE_URL = 'http://localhost:4000';

export interface EvaluationResult {
  tenderId: string;
  organizationId: string;
  matchScore: number;
  eligibilityStatus: string;
  summary: string;
  gaps: string[];
  recommendations: string[];
}

export async function evaluateTender(
  organizationId: string, 
  tenderId: string, 
  dynamicContext?: string
): Promise<EvaluationResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/tenders/${tenderId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dynamicContext }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to evaluate tender via backend');
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

    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/documents/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to extract document text via backend');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
}

export async function fetchTendersFromDb() {
  try {
    const response = await fetch(`${API_BASE_URL}/tenders`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenders from database');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching real tenders:', error);
    return [];
  }
}