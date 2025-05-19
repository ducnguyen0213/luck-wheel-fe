'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAdminProfile, refreshAccessToken, logoutAdmin } from './api';

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
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Hàm để refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      await refreshAccessToken();
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (token) {
          try {
            // Thử lấy thông tin profile với token hiện tại
            const { data } = await getAdminProfile();
            if (data && data.success) {
              setAdmin(data.data);
              setIsAuthenticated(true);
            } else {
              // Nếu không thành công, thử refresh token
              const refreshed = await refreshToken();
              if (refreshed) {
                // Lấy lại thông tin profile sau khi refresh token
                const refreshedProfile = await getAdminProfile();
                if (refreshedProfile.data && refreshedProfile.data.success) {
                  setAdmin(refreshedProfile.data.data);
                  setIsAuthenticated(true);
                } else {
                  handleLogout();
                }
              } else {
                handleLogout();
              }
            }
          } catch (error: any) {
            console.error('Error checking auth:', error);
            
            // Nếu lỗi 401, thử refresh token
            if (error.response?.status === 401) {
              const refreshed = await refreshToken();
              if (refreshed) {
                // Lấy lại thông tin profile sau khi refresh token
                try {
                  const refreshedProfile = await getAdminProfile();
                  if (refreshedProfile.data && refreshedProfile.data.success) {
                    setAdmin(refreshedProfile.data.data);
                    setIsAuthenticated(true);
                  } else {
                    handleLogout();
                  }
                } catch (profileError) {
                  handleLogout();
                }
              } else {
                handleLogout();
              }
            } else {
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const login = (token: string, adminData: Admin) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Gọi API logout để xóa refresh token cookie
      await logoutAdmin();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      handleLogout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshToken,
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