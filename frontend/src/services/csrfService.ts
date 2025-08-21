interface CsrfToken {
  token: string;
  headerName: string;
  parameterName: string;
}

class CsrfService {
  private csrfToken: CsrfToken | null = null;

  async getCsrfToken(): Promise<CsrfToken> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    this.csrfToken = await response.json();
    return this.csrfToken;
  }

  async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getCsrfToken();
    return {
      [token.headerName]: token.token
    };
  }

  clearToken(): void {
    this.csrfToken = null;
  }
}

export const csrfService = new CsrfService();