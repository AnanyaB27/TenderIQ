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

export async function evaluateTender(organizationId: string, tenderId: string): Promise<EvaluationResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/tenders/${tenderId}/evaluate`, {
      method: 'POST',
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