import { Question } from '../types';
import config from '../config';

// Use configuration from config file
const API_BASE_URL = config.API_BASE_URL;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
      credentials: 'include', // Include cookies for session-based auth
    });

    return response;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else {
        errorMessage = await response.text();
      }
      
      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  }

  // Health check method (no auth required)
  async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
    const url = `${this.baseURL}/api/health`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  }

  // Auth Methods
  async getCurrentUser() {
    const response = await this.fetchWithAuth('/api/auth/user');
    return this.handleResponse<any>(response);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Question Methods
  async getQuestions(): Promise<Question[]> {
    const response = await this.fetchWithAuth('/api/questions');
    return this.handleResponse<Question[]>(response);
  }

  async getQuestion(id: string): Promise<Question> {
    const response = await this.fetchWithAuth(`/api/questions/${id}`);
    return this.handleResponse<Question>(response);
  }

  async createQuestion(questionData: Omit<Question, 'id' | 'userId'>): Promise<Question> {
    const response = await this.fetchWithAuth('/api/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
    return this.handleResponse<Question>(response);
  }

  async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question> {
    const response = await this.fetchWithAuth(`/api/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(questionData),
    });
    return this.handleResponse<Question>(response);
  }

  async deleteQuestion(id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/questions/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse<void>(response);
  }

  async deleteAllQuestions(): Promise<{ count: number }> {
    const response = await this.fetchWithAuth('/api/questions', {
      method: 'DELETE',
    });
    return this.handleResponse<{ count: number }>(response);
  }

  async reorderQuestions(questionIds: string[]): Promise<void> {
    const response = await this.fetchWithAuth('/api/questions/reorder', {
      method: 'POST',
      body: JSON.stringify({ questionIds }),
    });
    return this.handleResponse<void>(response);
  }

  // Preferences Methods
  async getPreferences(): Promise<any> {
    const response = await this.fetchWithAuth('/api/preferences');
    return this.handleResponse<any>(response);
  }

  async updatePreferences(preferences: any): Promise<any> {
    const response = await this.fetchWithAuth('/api/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
    return this.handleResponse<any>(response);
  }

  // Study Session Methods
  async getStudySessions(): Promise<any[]> {
    const response = await this.fetchWithAuth('/api/study-sessions');
    return this.handleResponse<any[]>(response);
  }

  async createStudySession(sessionData: any): Promise<any> {
    const response = await this.fetchWithAuth('/api/study-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
    return this.handleResponse<any>(response);
  }

  // Template Methods
  async getTemplates(): Promise<any[]> {
    const response = await this.fetchWithAuth('/api/templates');
    return this.handleResponse<any[]>(response);
  }

  async createTemplate(templateData: any): Promise<any> {
    const response = await this.fetchWithAuth('/api/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return this.handleResponse<any>(response);
  }

  // Utility Methods
  getLoginUrl(): string {
    return `${this.baseURL}/api/login`;
  }

  getLogoutUrl(): string {
    return `${this.baseURL}/api/logout`;
  }
}

export const apiService = new ApiService();
export default ApiService;