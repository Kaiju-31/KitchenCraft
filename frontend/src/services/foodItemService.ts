import type { FoodItem, ApiError } from '../types';
import { authService } from './authService';

const API_BASE_URL = '/api';

class FoodItemService {
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

  private getAuthenticatedFetchOptions(body?: any): RequestInit {
    const options: RequestInit = {
      headers: {
        ...authService.getAuthHeaders(),
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
    }

    return options;
  }

  async getAllFoodItems(name?: string, basicCategory?: string): Promise<FoodItem[]> {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (basicCategory && basicCategory !== 'Tous') params.append('basicCategory', basicCategory);
    
    const url = `${API_BASE_URL}/food-items${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, this.getAuthenticatedFetchOptions());
    return this.handleResponse<FoodItem[]>(response);
  }

  async getFoodItemById(id: number): Promise<FoodItem> {
    const response = await fetch(`${API_BASE_URL}/food-items/${id}`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<FoodItem>(response);
  }

  async searchByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/food-items/search/${barcode}`, this.getAuthenticatedFetchOptions());
      if (response.ok) {
        return this.handleResponse<FoodItem>(response);
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la recherche par code-barres:', error);
      return null;
    }
  }

  async createFoodItem(foodItem: Partial<FoodItem>): Promise<FoodItem> {
    const response = await fetch(`${API_BASE_URL}/food-items`, {
      ...this.getAuthenticatedFetchOptions(foodItem),
      method: 'POST',
    });
    return this.handleResponse<FoodItem>(response);
  }

  async updateFoodItem(id: number, foodItem: Partial<FoodItem>): Promise<FoodItem> {
    const response = await fetch(`${API_BASE_URL}/food-items/${id}`, {
      ...this.getAuthenticatedFetchOptions(foodItem),
      method: 'PUT',
    });
    return this.handleResponse<FoodItem>(response);
  }

  async deleteFoodItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/food-items/${id}`, {
      ...this.getAuthenticatedFetchOptions(),
      method: 'DELETE',
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

  async syncWithOpenFoodFacts(id: number): Promise<FoodItem> {
    const response = await fetch(`${API_BASE_URL}/food-items/${id}/sync`, {
      ...this.getAuthenticatedFetchOptions(),
      method: 'POST',
    });
    return this.handleResponse<FoodItem>(response);
  }

  async getStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/food-items/stats`, this.getAuthenticatedFetchOptions());
    return this.handleResponse<any>(response);
  }
}

export const foodItemService = new FoodItemService();