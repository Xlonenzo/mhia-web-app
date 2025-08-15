import { api } from './api';
import { API_ENDPOINTS } from '../config/api';
import type { 
  LoginCredentials, 
  User,
  Token,
  UserCreate,
  UserResponse
} from '../types/auth';

export interface AuthResponse {
  user: User;
  token: Token;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<Token>(API_ENDPOINTS.auth.login, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const token = response.data;
    
    // Store token
    localStorage.setItem('access_token', token.access_token);
    
    // Get user info (you might need to implement a /me endpoint)
    const user = await this.getCurrentUser();
    
    return { user, token };
  }

  // Register new user
  async register(userData: UserCreate): Promise<UserResponse> {
    const response = await api.post<UserResponse>(
      API_ENDPOINTS.auth.register,
      userData
    );
    return response.data;
  }

  // Get current user (you might need to implement this endpoint)
  async getCurrentUser(): Promise<User> {
    // For now, we'll create a mock user based on stored data
    // In a real implementation, you'd call an endpoint like /api/v1/auth/me
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    // Mock user for development
    const mockUser: User = {
      id: '1',
      username: 'demo_user',
      email: 'demo@mhia.com',
      full_name: 'Demo User',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get stored user
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Refresh token (if needed)
  async refreshToken(): Promise<Token | null> {
    try {
      // Implement token refresh logic here
      // This would typically call a /refresh endpoint
      const token = this.getToken();
      if (!token) return null;
      
      // For now, return the existing token
      return {
        access_token: token,
        token_type: 'bearer'
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    // This would typically call a /profile endpoint
    const currentUser = this.getUser();
    if (!currentUser) {
      throw new Error('No user found');
    }

    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // This would typically call a /change-password endpoint
    // For now, just validate the current password
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    // In a real implementation, you'd send this to the backend
    console.log('Password change requested');
  }
}

export const authService = new AuthService();
export default authService; 