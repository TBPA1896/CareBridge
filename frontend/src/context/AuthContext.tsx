import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse, User, Role } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemoClinician: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('carebridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('carebridge_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const storeSession = (res: AuthResponse) => {
    const loggedUser: User = {
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      status: res.status,
    };
    setToken(res.token);
    setUser(loggedUser);
    localStorage.setItem('carebridge_token', res.token);
    localStorage.setItem('carebridge_user', JSON.stringify(loggedUser));
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('carebridge_token');
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          const refreshedUser: User = {
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role,
            phone: profile.phone,
            status: profile.status,
            createdAt: profile.createdAt,
          };
          setUser(refreshedUser);
          localStorage.setItem('carebridge_user', JSON.stringify(refreshedUser));
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      storeSession(res);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoClinician = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.demoClinicianLogin();
      storeSession(res);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      const registeredUser: User = {
        id: res.userId,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
        status: res.status,
      };
      setToken(res.token);
      setUser(registeredUser);
      localStorage.setItem('carebridge_token', res.token);
      localStorage.setItem('carebridge_user', JSON.stringify(registeredUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('carebridge_token');
    localStorage.removeItem('carebridge_user');
  };

  const refreshUser = async () => {
    try {
      const profile = await authApi.getMe();
      const updatedUser: User = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        phone: profile.phone,
        status: profile.status,
        createdAt: profile.createdAt,
      };
      setUser(updatedUser);
      localStorage.setItem('carebridge_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        loginAsDemoClinician,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
