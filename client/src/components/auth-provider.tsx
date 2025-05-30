import React, { createContext, useContext } from 'react';
import { useAuthManager } from '@/hooks/use-user-auth';
import { type User, type SignupData, type LoginData } from '@shared/schema';

interface UserWithAdmin extends User {
  isAdmin?: boolean;
}

interface AuthContextType {
  user: UserWithAdmin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useUserAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authManager = useAuthManager();

  return (
    <AuthContext.Provider value={authManager}>
      {children}
    </AuthContext.Provider>
  );
}