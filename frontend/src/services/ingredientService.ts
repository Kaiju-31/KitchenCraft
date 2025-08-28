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

  // Nouvelles méthodes pour le système nutritionnel fusionné
  
  async getIngredientById(id: number): Promise<Ingredient> {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<Ingredient>(response);
  }
  
  async searchIngredients(name?: string, basicCategory?: string): Promise<Ingredient[]> {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (basicCategory) params.set('basicCategory', basicCategory);
    
    const response = await fetch(`${API_BASE_URL}/ingredients/search?${params.toString()}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<Ingredient[]>(response);
  }
  
  async getByBasicCategory(basicCategory: string): Promise<Ingredient[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients/category/${encodeURIComponent(basicCategory)}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<Ingredient[]>(response);
  }
  
  async findByBarcode(barcode: string): Promise<Ingredient | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/barcode/${encodeURIComponent(barcode)}`, this.getAuthenticatedFetchOptions());
      if (response.status === 404) {
        return null;
      }
      return this.handleResponse<Ingredient>(response);
    } catch (error) {
      if ((error as ApiError).status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  async searchByBarcode(barcode: string): Promise<Ingredient | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/search-barcode/${encodeURIComponent(barcode)}`, this.getAuthenticatedFetchOptions());
      if (response.status === 404) {
        return null;
      }
      return this.handleResponse<Ingredient>(response);
    } catch (error) {
      if ((error as ApiError).status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  async searchOpenFoodFactsOnly(barcode: string): Promise<Ingredient | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/search-openfoodfacts/${encodeURIComponent(barcode)}`, this.getAuthenticatedFetchOptions());
      if (response.status === 404) {
        return null;
      }
      return this.handleResponse<Ingredient>(response);
    } catch (error) {
      if ((error as ApiError).status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  async saveIngredient(ingredient: Ingredient): Promise<Ingredient> {
    const response = await fetch(`${API_BASE_URL}/ingredients/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(ingredient),
    });
    return this.handleResponse<Ingredient>(response);
  }
  
  async syncWithOpenFoodFacts(id: number): Promise<Ingredient> {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}/sync`, {
      method: 'POST',
      headers: {
        ...authService.getAuthHeaders(),
      },
    });
    return this.handleResponse<Ingredient>(response);
  }
  
  async getNutritionalStats(): Promise<{ withData: number; fromOpenFoodFacts: number }> {
    const [withDataResponse, fromApiResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/ingredients/stats/nutritional`, this.getAuthenticatedFetchOptions()),
      fetch(`${API_BASE_URL}/ingredients/stats/openfoodfacts`, this.getAuthenticatedFetchOptions())
    ]);
    
    const withData = await this.handleResponse<number>(withDataResponse);
    const fromOpenFoodFacts = await this.handleResponse<number>(fromApiResponse);
    
    return { withData, fromOpenFoodFacts };
  }
  
  async getAllFromOpenFoodFacts(): Promise<Ingredient[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients/openfoodfacts`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<Ingredient[]>(response);
  }
  
  async getAllManual(): Promise<Ingredient[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients/manual`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<Ingredient[]>(response);
  }
}

export const ingredientService = new IngredientService();