import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type User, type SignupData, type LoginData } from '@shared/schema';

export function useAuthManager() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  
  const queryClient = useQueryClient();

  // Query to get current user profile
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/profile'],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('auth_token', data.token);
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await apiRequest('POST', '/api/auth/signup', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('auth_token', data.token);
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
    queryClient.clear();
  };

  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const signup = async (data: SignupData) => {
    await signupMutation.mutateAsync(data);
  };

  return {
    user: user || null,
    isLoading: isLoading || loginMutation.isPending || signupMutation.isPending,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    logout,
    token
  };
}