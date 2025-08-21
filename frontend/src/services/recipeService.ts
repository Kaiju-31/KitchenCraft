import type { Recipe, RecipeRequest, ApiError } from '../types';
import { csrfService } from './csrfService';

const API_BASE_URL = '/api';

class RecipeService {
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

  async getAllRecipes(scaledPerson?: number): Promise<Recipe[]> {
    const url = scaledPerson 
      ? `${API_BASE_URL}/recipes?scaledPerson=${scaledPerson}`
      : `${API_BASE_URL}/recipes`;
    
    const response = await fetch(url);
    return this.handleResponse<Recipe[]>(response);
  }

  async getRecipeById(id: number, scaledPerson?: number): Promise<Recipe> {
    const url = scaledPerson 
      ? `${API_BASE_URL}/recipes/${id}?scaledPerson=${scaledPerson}`
      : `${API_BASE_URL}/recipes/${id}`;
    
    const response = await fetch(url);
    return this.handleResponse<Recipe>(response);
  }

  async searchRecipesByName(name: string, scaledPerson?: number): Promise<Recipe[]> {
    const params = new URLSearchParams({ name });
    if (scaledPerson) {
      params.append('scaledPerson', scaledPerson.toString());
    }

    const response = await fetch(`${API_BASE_URL}/recipes/by-name?${params.toString()}`);
    return this.handleResponse<Recipe[]>(response);
  }

  async searchRecipesByIngredients(ingredients: string, scaledPerson?: number): Promise<Recipe[]> {
    const params = new URLSearchParams({ ingredients });
    if (scaledPerson) {
      params.append('scaledPerson', scaledPerson.toString());
    }

    const response = await fetch(`${API_BASE_URL}/recipes/by-ingredients?${params.toString()}`);
    return this.handleResponse<Recipe[]>(response);
  }

  // Alias pour compatibilité
  async searchByIngredientsString(ingredients: string, scaledPerson?: number): Promise<Recipe[]> {
    return this.searchRecipesByIngredients(ingredients, scaledPerson);
  }

  async createRecipe(data: RecipeRequest): Promise<Recipe> {
    const csrfHeaders = await csrfService.getHeaders();
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return this.handleResponse<Recipe>(response);
  }

  async updateRecipe(id: number, data: RecipeRequest): Promise<Recipe> {
    const csrfHeaders = await csrfService.getHeaders();
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return this.handleResponse<Recipe>(response);
  }

  async deleteRecipe(id: number): Promise<void> {
    const csrfHeaders = await csrfService.getHeaders();
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
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

  async getRecipeCount(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/recipes/count`);
    return this.handleResponse<number>(response);
  }

  async getAutocomplete(query: string, limit: number = 10): Promise<string[]> {
    const params = new URLSearchParams({ 
      q: query,
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/recipes/autocomplete?${params.toString()}`);
    return this.handleResponse<string[]>(response);
  }

  async getPopularRecipes(limit: number = 20, fromPlans: boolean = false): Promise<string[]> {
    const params = new URLSearchParams({ 
      limit: limit.toString(),
      fromPlans: fromPlans.toString()
    });

    const response = await fetch(`${API_BASE_URL}/recipes/popular?${params.toString()}`);
    return this.handleResponse<string[]>(response);
  }

  async searchRecipesByPrefix(prefix: string, limit: number = 10): Promise<string[]> {
    const params = new URLSearchParams({ 
      q: prefix,
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/recipes/search-prefix?${params.toString()}`);
    return this.handleResponse<string[]>(response);
  }

  async searchRecipesContaining(search: string, limit: number = 10): Promise<string[]> {
    const params = new URLSearchParams({ 
      q: search,
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/recipes/search-contains?${params.toString()}`);
    return this.handleResponse<string[]>(response);
  }

  async filterRecipes(
    searchTerm?: string,
    ingredients?: string[],
    minTime?: number,
    maxTime?: number,
    origins?: string[],
    isBabyFriendly?: boolean,
    scaledPerson?: number
  ): Promise<Recipe[]> {
    const params = new URLSearchParams();
    
    if (searchTerm && searchTerm.trim()) {
      params.append('searchTerm', searchTerm.trim());
    }
    
    if (ingredients && ingredients.length > 0) {
      ingredients.forEach(ingredient => {
        params.append('ingredients', ingredient);
      });
    }
    
    if (minTime !== undefined) {
      params.append('minTime', minTime.toString());
    }
    
    if (maxTime !== undefined) {
      params.append('maxTime', maxTime.toString());
    }
    
    if (origins && origins.length > 0) {
      origins.forEach(origin => {
        params.append('origins', origin);
      });
    }
    
    if (isBabyFriendly !== undefined) {
      params.append('isBabyFriendly', isBabyFriendly.toString());
    }
    
    if (scaledPerson !== undefined) {
      params.append('scaledPerson', scaledPerson.toString());
    }

    const response = await fetch(`${API_BASE_URL}/recipes/filter?${params.toString()}`);
    return this.handleResponse<Recipe[]>(response);
  }

  async getAllOrigins(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/recipes/origins`);
    return this.handleResponse<string[]>(response);
  }
}

export const recipeService = new RecipeService();