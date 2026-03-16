import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import authService, { UserMe } from '@/services/auth.service';

interface AuthContextType {
  user: UserMe | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const isAuth = authService.isAuthenticated();

  const { data: user, isLoading } = useQuery<UserMe>({
    queryKey: ['user-me'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuth,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
  });

  const logout = () => {
    authService.logout();
    queryClient.clear();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: isAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
