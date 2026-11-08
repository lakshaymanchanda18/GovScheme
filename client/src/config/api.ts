function getBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // If envUrl is empty, or points to the obsolete onrender.com backend,
  // route to the same-origin Vercel serverless backend at '/api'.
  if (!envUrl || envUrl.includes('onrender.com')) {
    return '/api';
  }

  if (envUrl === '/api' || envUrl.endsWith('/api')) {
    return envUrl;
  }
  return `${envUrl.replace(/\/+$/, '')}/api`;
}

export const API_BASE_URL = getBaseUrl();

export function getApiUrl(endpoint: string) {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (normalizedBase.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
    normalizedEndpoint = normalizedEndpoint.slice(4);
  }
  return `${normalizedBase}${normalizedEndpoint}`;
}
