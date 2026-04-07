import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import authService, { UserMe, UserContext } from '@/services/auth.service';

interface AuthContextType {
  user: UserMe | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  currentContextId: string | undefined;
  setCurrentContextId: (id: string) => void;
  currentContext: UserContext | undefined;
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

  const [currentContextId, setCtxId] = useState<string | undefined>(() => {
    return localStorage.getItem('selected_context_id') || undefined;
  });

  useEffect(() => {
    if (user?.dashboard?.contexts && user.dashboard.contexts.length > 0) {
      if (!currentContextId || !user.dashboard.contexts.some(c => c.context_id === currentContextId)) {
        const firstCtx = user.dashboard.contexts[0].context_id;
        setCtxId(firstCtx);
        localStorage.setItem('selected_context_id', firstCtx);
      }
    }
  }, [user, currentContextId]);

  const setCurrentContextId = (id: string) => {
    setCtxId(id);
    localStorage.setItem('selected_context_id', id);
    // When context changes, we might want to invalidate queries rely on plan/context
    queryClient.invalidateQueries();
  };

  const currentContext = useMemo(() => {
    return user?.dashboard?.contexts?.find(c => c.context_id === currentContextId);
  }, [user, currentContextId]);

  const logout = () => {
    authService.logout();
    localStorage.removeItem('selected_context_id');
    queryClient.clear();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: isAuth, 
      logout,
      currentContextId,
      setCurrentContextId,
      currentContext
    }}>
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
