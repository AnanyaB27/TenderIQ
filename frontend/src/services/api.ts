const API_BASE_URL = 'http://localhost:4000';

export async function checkBackendHealth(): Promise<{ status: string }> {
  try {
    // Attempt to hit the root healthz endpoint mapped in NestJS
    const response = await fetch(`${API_BASE_URL}/healthz`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Connection Error:', error);
    throw error;
  }
}