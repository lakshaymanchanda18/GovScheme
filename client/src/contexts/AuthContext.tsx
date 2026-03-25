import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the current user profile using the HTTP-Only cookie (sent automatically by browser)
  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
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

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      // Cookie is set automatically by the browser from the Set-Cookie header
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.response?.data?.error || error.message || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      // Cookie is set automatically by the browser from the Set-Cookie header
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error: any) {
      console.error('Registration error:', error);
      const msg = error.response?.data?.error || error.message || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch {
      // Even if server logout fails, clear client state
    }
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
