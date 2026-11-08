const rawBase = (import.meta.env.VITE_API_URL || '/api').trim();
const baseWithApi = rawBase.endsWith('/api') || rawBase === '/api'
  ? rawBase
  : `${rawBase.replace(/\/+$/, '')}/api`;

export const API_BASE_URL = baseWithApi;

export function getApiUrl(endpoint: string) {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (normalizedBase.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
    normalizedEndpoint = normalizedEndpoint.slice(4);
  }
  return `${normalizedBase}${normalizedEndpoint}`;
}
