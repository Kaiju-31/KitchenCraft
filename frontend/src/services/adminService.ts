import { authService } from './authService';

interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roles: Array<{ id: number; name: string }>;
  createdAt: string;
  updatedAt?: string;
  enabled: boolean;
}

interface AdminStats {
  totalUsers: number;
  totalRecipes: number;
  totalIngredients: number;
  totalPlans: number;
  activeUsers: number;
  mostPopularRecipeOrigin: string;
  mostUsedIngredientCategory: string;
}

interface UpdateRoleRequest {
  roleName: 'ROLE_USER' | 'ROLE_ADMIN';
}

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
}

interface EditUserRequest {
  username: string;
  email: string;
  password?: string;
}

const API_BASE_URL = '/api/admin';

class AdminService {
  private getAuthHeaders() {
    return authService.getAuthHeaders();
  }

  async getStats(): Promise<AdminStats> {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    
    return response.json();
  }

  async getAllUsers(): Promise<AdminUser[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
    
    return response.json();
  }

  async createUser(userData: CreateUserRequest): Promise<AdminUser> {
    const response = await fetch(`${API_BASE_URL}/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      let errorMessage = 'Erreur lors de la création de l\'utilisateur';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Erreur lors de la création (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  async updateUserRole(userId: number, roleName: 'ROLE_USER' | 'ROLE_ADMIN'): Promise<AdminUser> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ roleName }),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du rôle');
    }
    
    return response.json();
  }

  async updateUser(userId: number, userData: EditUserRequest): Promise<AdminUser> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      let errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Erreur lors de la mise à jour (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
  }

  async getOrphanIngredients(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients/orphans`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des ingrédients orphelins');
    }
    
    return response.json();
  }

  async cleanupData(): Promise<{ message: string; deletedCount: number; description: string }> {
    const response = await fetch(`${API_BASE_URL}/data/cleanup`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du nettoyage des données');
    }
    
    return response.json();
  }

  async testAdminAccess(): Promise<{ message: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/test`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Accès admin refusé');
    }
    
    return response.json();
  }

  async getSignupStatus(): Promise<{ enabled: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/signup-status`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du statut du signup');
    }
    
    return response.json();
  }

  async updateSignupStatus(enabled: boolean): Promise<{ enabled: boolean; message: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/signup-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ enabled }),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du statut du signup');
    }
    
    return response.json();
  }
}

const adminService = new AdminService();

export { adminService };
export type { AdminUser, AdminStats, UpdateRoleRequest, CreateUserRequest, EditUserRequest };