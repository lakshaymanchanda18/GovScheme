import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

// Configure axios globally to send cookies with every request
axios.defaults.withCredentials = true;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  aadharNumber?: string;
  panNumber?: string;
  income?: number;
  occupation?: string;
  education?: string;
  familySize?: number;
  disability?: string;
  veteranStatus?: string;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionExpiringWarning: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  dismissSessionWarning: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiringWarning, setSessionExpiringWarning] = useState(false);
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch the current user profile using the HTTP-Only cookie
  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get(getApiUrl('/auth/profile'));
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: check if the user is already authenticated via cookie
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Token refresh
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      await axios.post(getApiUrl('/auth/refresh'));
      setSessionExpiringWarning(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Session expiry monitoring
  useEffect(() => {
    if (!user) {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
      return;
    }

    sessionCheckInterval.current = setInterval(() => {
      axios.get(getApiUrl('/auth/profile'))
        .then(() => {
          // Session still valid
        })
        .catch((error) => {
          if (error.response?.status === 401 || error.response?.status === 403) {
            setUser(null);
            setSessionExpiringWarning(false);
          }
        });
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(getApiUrl('/auth/login'), { email, password });
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error: any) {
      console.error('Login error:', error);
      let msg = error.response?.data?.details?.[0]?.message || error.response?.data?.error;
      if (!msg) {
        if (error.message === 'Network Error' || !error.response) {
          msg = 'Unable to connect to the backend server. Please start the backend server at http://localhost:5001.';
        } else {
          msg = error.message || 'Login failed';
        }
      }
      return { success: false, error: msg };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await axios.post(getApiUrl('/auth/register'), userData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error: any) {
      console.error('Registration error:', error);
      let msg = error.response?.data?.details?.[0]?.message || error.response?.data?.error;
      if (!msg) {
        if (error.message === 'Network Error' || !error.response) {
          msg = 'Unable to connect to the backend server. Please start the backend server at http://localhost:5001.';
        } else {
          msg = error.message || 'Registration failed';
        }
      }
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await axios.post(getApiUrl('/auth/logout'));
    } catch {
      // Clear client state
    }
    setUser(null);
    setSessionExpiringWarning(false);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const dismissSessionWarning = () => {
    setSessionExpiringWarning(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      sessionExpiringWarning,
      login,
      register,
      logout,
      refreshUser,
      refreshToken,
      dismissSessionWarning,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
