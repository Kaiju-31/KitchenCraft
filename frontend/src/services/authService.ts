export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt?: string;
}

interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const API_BASE_URL = '/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Si la réponse n'est pas du JSON, utiliser le status text
        errorMessage = `Login failed (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      const data = await response.json();
      setAuthToken(data.token);
      return data;
    } catch (e) {
      throw new Error('Invalid server response format');
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Si la réponse n'est pas du JSON, utiliser le status text
        errorMessage = `Registration failed (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      const data = await response.json();
      setAuthToken(data.token);
      return data;
    } catch (e) {
      throw new Error('Invalid server response format');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Session expired');
      }
      
      let errorMessage = 'Failed to fetch user profile';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Failed to fetch user profile (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (e) {
      throw new Error('Invalid server response format');
    }
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profile update failed');
    }

    return response.json();
  },

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/change-password`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }
  },

  logout() {
    removeAuthToken();
  },

  isAuthenticated(): boolean {
    const token = getAuthToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  getAuthHeaders,
  getAuthToken,
};