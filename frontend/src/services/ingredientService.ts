import type { Ingredient, IngredientRequest, ApiError } from '../types';
import { authService } from './authService';

const API_BASE_URL = '/api';

class IngredientService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.text();
      const error: ApiError = {
        message: errorData || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
      throw error;
    }
    return response.json();
  }

  private getAuthenticatedFetchOptions(): RequestInit {
    return {
      headers: {
        ...authService.getAuthHeaders(),
      },
    };
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<Ingredient[]>(response);
  }

  async createIngredient(data: IngredientRequest): Promise<Ingredient> {
    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Ingredient>(response);
  }

  async updateIngredient(id: number, data: IngredientRequest): Promise<Ingredient> {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Ingredient>(response);
  }

  async deleteIngredient(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'DELETE',
      headers: {
        ...authService.getAuthHeaders(),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      const error: ApiError = {
        message: errorData || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
      throw error;
    }
  }

  async getIngredientByName(name: string): Promise<Ingredient> {
    const response = await fetch(`${API_BASE_URL}/ingredients/by-name?name=${encodeURIComponent(name)}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<Ingredient>(response);
  }

  async getAutocomplete(query: string, limit: number = 10): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<string[]>(response);
  }

  async getPopularIngredients(limit: number = 20, fromPlans: boolean = false): Promise<string[]> {
    const params = new URLSearchParams({ 
      limit: limit.toString(),
      fromPlans: fromPlans.toString()
    });
    
    const response = await fetch(`${API_BASE_URL}/ingredients/popular?${params.toString()}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<string[]>(response);
  }

  async searchByPrefix(query: string, limit: number = 10): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients/search-prefix?q=${encodeURIComponent(query)}&limit=${limit}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<string[]>(response);
  }

  async searchContaining(query: string, limit: number = 10): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients/search-contains?q=${encodeURIComponent(query)}&limit=${limit}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<string[]>(response);
  }
}

export const ingredientService = new IngredientService();