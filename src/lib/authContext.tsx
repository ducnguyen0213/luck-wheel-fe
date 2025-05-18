'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAdminProfile } from './api';

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (token) {
          try {
            const { data } = await getAdminProfile();
            if (data && data.success) {
              setAdmin(data.data);
              setIsAuthenticated(true);
            } else {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
              }
            }
          } catch (error) {
            console.error('Error checking auth:', error);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
            }
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, adminData: Admin) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
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