import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoginCredentials, User } from '../types/auth';
import { authService } from '../services/authService';

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Get current user
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data: AuthResponse) => {
      // Update user in cache
      queryClient.setQueryData(['auth', 'user'], data.user);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: UserCreate) => authService.register(userData),
    onSuccess: (data: UserResponse) => {
      console.log('Registration successful:', data);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  // Logout function
  const logout = () => {
    authService.logout();
    // Clear all queries from cache
    queryClient.clear();
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && authService.isAuthenticated();

  return {
    // Data
    user,
    isAuthenticated,
    
    // Loading states
    isLoadingUser,
    
    // Errors
    userError,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    
    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    
    // Loading states for actions
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};

// Hook for protected routes
export const useRequireAuth = () => {
  const { user, isAuthenticated, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return { user: null, isAuthenticated: false, isLoading: true };
  }

  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = '/login';
    return { user: null, isAuthenticated: false, isLoading: false };
  }

  return { user, isAuthenticated, isLoading: false };
}; 