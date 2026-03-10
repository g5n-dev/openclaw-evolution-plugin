/**
 * OpenClaw Evolution Console - API Client
 *
 * HTTP client for communicating with the Evolution Service API.
 */

const API_BASE_URL = '/v1';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// API Methods
export const api = {
  // Insights
  getDashboard: (timeRange?: string, sessionId?: string) =>
    apiClient.get(`/insights/dashboard?time_range=${timeRange || 'day'}${sessionId ? `&session_id=${sessionId}` : ''}`),

  getFunnel: (timeRange?: string, sessionId?: string) =>
    apiClient.get(`/insights/funnel?time_range=${timeRange || 'day'}${sessionId ? `&session_id=${sessionId}` : ''}`),

  getCompatibility: () =>
    apiClient.get('/insights/compatibility'),

  // Candidates
  getCandidates: (params?: { sessionId?: string; status?: string; limit?: number }) =>
    apiClient.get(`/candidates${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),

  getCandidate: (id: string) =>
    apiClient.get(`/candidates/${id}`),

  createCandidate: (data: unknown) =>
    apiClient.post('/candidates', data),

  // Evaluations
  runEvaluation: (data: unknown) =>
    apiClient.post('/evaluations/run', data),

  getEvaluation: (id: string) =>
    apiClient.get(`/evaluations/${id}`),

  // Cards
  getCards: (params?: { sessionId?: string; status?: string; limit?: number }) =>
    apiClient.get(`/cards${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),

  getCard: (id: string) =>
    apiClient.get(`/cards/${id}`),

  submitCardDecision: (id: string, decision: { decision: string; comment?: string }) =>
    apiClient.post(`/cards/${id}/decision`, decision),

  // Skills
  getSkills: (params?: { status?: string; skillType?: string; limit?: number }) =>
    apiClient.get(`/skills${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),

  getSkill: (id: string) =>
    apiClient.get(`/skills/${id}`),

  promoteSkill: (data: unknown) =>
    apiClient.post('/skills/promote', data),

  rollbackSkill: (data: unknown) =>
    apiClient.post('/skills/rollback', data),
};
