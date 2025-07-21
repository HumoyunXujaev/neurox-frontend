'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  apiClient,
  type User,
  type LoginData,
  type RegisterData,
} from '@/lib/api/client';
import { tokenManager } from '@/lib/auth/token-manager';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/',
  '/reset-password',
  '/terms',
  '/privacy',
  '/404',
  '/not-found',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      if (!tokenManager.hasValidSession()) {
        setUser(null);
        return false;
      }

      // Get cached user first
      const cachedUser = tokenManager.getUser();
      if (cachedUser && !tokenManager.shouldRefreshToken()) {
        setUser(cachedUser);
        return true;
      }

      const response = await apiClient.auth.getMe();
      const userData = response.data;

      setUser(userData);
      tokenManager.setUser(userData);

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      tokenManager.clearTokens();
      return false;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const isAuth = await checkAuth();

        // Redirect logic
        if (!isAuth && !PUBLIC_ROUTES.includes(pathname)) {
          router.push('/login');
        } else if (isAuth && PUBLIC_ROUTES.includes(pathname)) {
          router.push('/agents');
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (data: LoginData) => {
      try {
        setIsLoading(true);
        const response = await apiClient.auth.login(data);
        const { access_token, refresh_token, user: userData } = response.data;

        tokenManager.setTokens(access_token, refresh_token);
        tokenManager.setUser(userData);
        setUser(userData);

        toast.success('Успешный вход', {
          description: `Добро пожаловать, ${userData.name}!`,
        });

        router.push('/agents');
      } catch (error: any) {
        console.error('Login error:', error);

        if (error.response?.data?.detail) {
          throw new Error(error.response.data.detail);
        } else {
          throw new Error('Ошибка входа. Проверьте email и пароль.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true);
        const response = await apiClient.auth.register(data);
        const userData = response.data;
        console.log('Register response:', response);

        toast.success('Регистрация успешна', {
          description: 'Теперь вы можете войти в систему',
        });

        // Auto-login after registration
        await login({
          email: data.email,
          password: data.password,
        });
      } catch (error: any) {
        console.error('Register error:', error);

        if (error.response?.data?.detail) {
          throw new Error(error.response.data.detail);
        } else {
          throw new Error('Ошибка регистрации. Попробуйте позже.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      try {
        await apiClient.auth.logout();
      } catch (error) {
        console.error('Logout API error:', error);
      }

      tokenManager.clearTokens();
      setUser(null);

      toast.success('Вы вышли из системы');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.auth.getMe();
      const userData = response.data;

      setUser(userData);
      tokenManager.setUser(userData);
    } catch (error) {
      console.error('Refresh user error:', error);
      await logout();
    }
  }, [logout]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (tokenManager.shouldRefreshToken()) {
        checkAuth();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, checkAuth]);

  // Protect routes
  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuth = tokenManager.isAuthenticated();

    if (!isAuth && !isPublicRoute) {
      router.push('/login');
    } else if (isAuth && isPublicRoute && pathname !== '/') {
      router.push('/agents');
    }
  }, [pathname, isInitialized, router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && tokenManager.isAuthenticated(),
    login,
    register,
    logout,
    refreshUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: string;
    redirectTo?: string;
  }
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push(options?.redirectTo || '/login');
        } else if (
          options?.requiredRole &&
          user?.role !== options.requiredRole
        ) {
          toast.error('У вас нет доступа к этой странице');
          router.push('/agents');
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (options?.requiredRole && user?.role !== options.requiredRole) {
      return null;
    }

    return <Component {...props} />;
  };
}
