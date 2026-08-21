export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getApiUrl(endpoint: string) {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${normalizedBase}${normalizedEndpoint}`;
}
