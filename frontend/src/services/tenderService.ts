export interface Tender {
  id: string;
  title: string;
  description?: string;
  organization: string;
  deadline: string;
  value: string;
  status: string;
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

const API_BASE_URL = 'http://localhost:4000'; // Updated to match NestJS port 4000

export async function fetchTenders(): Promise<Tender[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tenders`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenders from backend');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tenders:', error);
    return [];
  }
}

export async function evaluateTender(organizationId: string, tenderId: string): Promise<EvaluationResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/tenders/${tenderId}/evaluate`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to evaluate tender via AI gateway');
    }
    return await response.json();
  } catch (error) {
    console.error('Error evaluating tender:', error);
    return null;
  }
}