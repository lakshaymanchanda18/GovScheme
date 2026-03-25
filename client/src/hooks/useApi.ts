import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios is globally configured with withCredentials in AuthContext.tsx
// This ensures the HTTP-Only cookie is sent with every request automatically

export const useApi = () => {
  const api = {
    get: async (endpoint: string, config: any = {}) => {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          ...config,
          withCredentials: true,
        });
        return response.data;
      } catch (error: any) {
        throw error.response?.data || { error: 'Network error' };
      }
    },

    post: async (endpoint: string, data = {}, config: any = {}) => {
      try {
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
          ...config,
          withCredentials: true,
        });
        return response.data;
      } catch (error: any) {
        throw error.response?.data || { error: 'Network error' };
      }
    },

    put: async (endpoint: string, data = {}, config: any = {}) => {
      try {
        const response = await axios.put(`${API_BASE_URL}${endpoint}`, data, {
          ...config,
          withCredentials: true,
        });
        return response.data;
      } catch (error: any) {
        throw error.response?.data || { error: 'Network error' };
      }
    },

    delete: async (endpoint: string, config: any = {}) => {
      try {
        const response = await axios.delete(`${API_BASE_URL}${endpoint}`, {
          ...config,
          withCredentials: true,
        });
        return response.data;
      } catch (error: any) {
        throw error.response?.data || { error: 'Network error' };
      }
    }
  };

  return { api };
};
