import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';
const TOKEN_LENGTH = 32;

// In-memory token store (in production, use Redis or session store)
const tokenStore = new Map<string, { token: string; expiresAt: number }>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokenStore.entries()) {
    if (now > value.expiresAt) {
      tokenStore.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Generate a CSRF token and set it as a cookie.
 * Client must read this cookie and send it back in X-CSRF-Token header.
 */
export function csrfGenerate(req: Request, res: Response, next: NextFunction) {
  const token = randomBytes(TOKEN_LENGTH).toString('hex');
  const userId = (req as any).user?.userId || 'anonymous';
  const key = `${userId}:${token}`;

  tokenStore.set(key, {
    token,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
  });

  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // Must be readable by JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2 * 60 * 60 * 1000,
    path: '/',
  });

  next();
}

/**
 * Validate the CSRF token on state-changing requests (POST, PUT, DELETE, PATCH).
 * Exempt: login, register, logout (no CSRF token yet), and GET/HEAD/OPTIONS.
 */
export function csrfProtect(req: Request, res: Response, next: NextFunction) {
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (safeMethod) return next();

  // Exempt auth endpoints (user doesn't have a CSRF token during login/register)
  const exemptPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];
  if (exemptPaths.some((p) => req.path.startsWith(p))) return next();

  const headerToken = req.headers[CSRF_HEADER] as string;
  const cookieToken = req.cookies?.[CSRF_COOKIE];

  if (!headerToken || !cookieToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      code: 'CSRF_ERROR',
      requestId: (req as any).requestId,
    });
  }

  if (headerToken !== cookieToken) {
    return res.status(403).json({
      error: 'CSRF token mismatch',
      code: 'CSRF_ERROR',
      requestId: (req as any).requestId,
    });
  }

  next();
}

/**
 * Endpoint handler that returns a fresh CSRF token.
 * GET /api/auth/csrf-token
 */
export function csrfTokenHandler(req: Request, res: Response) {
  const token = randomBytes(TOKEN_LENGTH).toString('hex');

  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({ csrfToken: token });
}
