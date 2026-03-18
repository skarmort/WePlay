import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in and token is valid
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      // Only set user if both token AND valid user JSON exist
      if (token && userStr) {
        try {
          const currentUser = JSON.parse(userStr);
          if (currentUser && currentUser.id) {
            setUser(currentUser);
          } else {
            // Invalid user data, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (e) {
          // Invalid JSON, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        // Clear potentially stale data if one is missing
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.signin({ usernameOrEmail: username, password });
      setUser(response);
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.signup({ username, email, password });
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    authAPI.signout();
    setUser(null);
    // Ensure user is returned to the initial landing page after logout
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;