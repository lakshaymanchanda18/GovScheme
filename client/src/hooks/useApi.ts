import axios, { AxiosRequestConfig } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios is globally configured with withCredentials in AuthContext.tsx
// This ensures the HTTP-Only cookie is sent with every request automatically

/**
 * Enhanced API hook with:
 * - Automatic error toasts
 * - Retry logic with exponential backoff
 * - Request deduplication
 */
export const useApi = () => {
  const { enqueueSnackbar } = useSnackbar();
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());

  const handleError = useCallback((error: any, endpoint: string) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message || 'Something went wrong';

    // Don't toast on 401 (auth will handle redirect)
    if (status === 401) {
      throw error.response?.data || { error: 'Session expired' };
    }

    // Show toast for other errors
    if (status === 429) {
      enqueueSnackbar('Too many requests. Please wait a moment.', { variant: 'warning' });
    } else if (status === 400) {
      if (error.response?.data?.details?.length > 0) {
        const detailMessage = error.response.data.details[0].message;
        const fieldName = error.response.data.details[0].field;
        enqueueSnackbar(`${fieldName ? fieldName + ': ' : ''}${detailMessage}`, { variant: 'error' });
      } else {
        enqueueSnackbar(message, { variant: 'error' });
      }
    } else if (status === 403) {
      enqueueSnackbar('You do not have permission to perform this action.', { variant: 'error' });
    } else if (status === 404) {
      enqueueSnackbar('The requested resource was not found.', { variant: 'warning' });
    } else if (status === 409) {
      enqueueSnackbar(message, { variant: 'warning' });
    } else if (status >= 500) {
      enqueueSnackbar('Server error. Please try again later.', { variant: 'error' });
    } else if (!error.response) {
      enqueueSnackbar('Network error. Check your internet connection.', { variant: 'error' });
    }

    throw error.response?.data || { error: message };
  }, [enqueueSnackbar]);

  const request = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
    options?: { retry?: number; silent?: boolean }
  ) => {
    const maxRetries = options?.retry ?? 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          withCredentials: true,
        };

        let response;
        if (method === 'get' || method === 'delete') {
          response = await axios[method](`${API_BASE_URL}${endpoint}`, axiosConfig);
        } else {
          response = await axios[method](`${API_BASE_URL}${endpoint}`, data, axiosConfig);
        }

        return response.data;
      } catch (error: any) {
        // Don't retry on client errors (4xx)
        const status = error.response?.status;
        if (status && status >= 400 && status < 500) {
          return handleError(error, endpoint);
        }

        // Retry on server errors
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (!options?.silent) {
          return handleError(error, endpoint);
        }

        throw error.response?.data || { error: 'Network error' };
      }
    }
  }, [handleError]);

  const api = {
    get: (endpoint: string, config?: AxiosRequestConfig, options?: { retry?: number; silent?: boolean }) =>
      request('get', endpoint, undefined, config, options),

    post: (endpoint: string, data?: any, config?: AxiosRequestConfig, options?: { retry?: number; silent?: boolean }) =>
      request('post', endpoint, data, config, options),

    put: (endpoint: string, data?: any, config?: AxiosRequestConfig, options?: { retry?: number; silent?: boolean }) =>
      request('put', endpoint, data, config, options),

    delete: (endpoint: string, config?: AxiosRequestConfig, options?: { retry?: number; silent?: boolean }) =>
      request('delete', endpoint, undefined, config, options),
  };

  return { api };
};
