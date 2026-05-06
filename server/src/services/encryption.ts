/**
 * AES-256-GCM field-level encryption for PII data.
 * Encrypts Aadhar numbers, PAN numbers, and other sensitive fields at rest.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT = 'govscheme-pii-salt-v1'; // In production, use env var

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-encryption-key-change-me';
  return scryptSync(secret, SALT, 32);
}

/**
 * Encrypt a plaintext string. Returns base64-encoded `iv:encrypted:tag`.
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}

/**
 * Decrypt a previously encrypted string.
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext || !ciphertext.includes(':')) return ciphertext;

  try {
    const key = getKey();
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return ciphertext;

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const tag = Buffer.from(parts[2], 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    // If decryption fails (e.g. data wasn't encrypted), return as-is
    return ciphertext;
  }
}

/**
 * Check if a value appears to be encrypted (has the iv:data:tag format).
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 3 && parts[0].length === 32 && parts[2].length === 32;
}

/** PII fields that should be encrypted at rest */
export const PII_FIELDS = ['aadharNumber', 'panNumber'] as const;

/**
 * Encrypt PII fields in a data object before writing to database.
 */
export function encryptPII<T extends Record<string, any>>(data: T): T {
  const result = { ...data };
  for (const field of PII_FIELDS) {
    if (result[field] && typeof result[field] === 'string' && !isEncrypted(result[field])) {
      (result as any)[field] = encrypt(result[field]);
    }
  }
  return result;
}

/**
 * Decrypt PII fields in a data object after reading from database.
 */
export function decryptPII<T extends Record<string, any>>(data: T): T {
  if (!data) return data;
  const result = { ...data };
  for (const field of PII_FIELDS) {
    if (result[field] && typeof result[field] === 'string' && isEncrypted(result[field])) {
      (result as any)[field] = decrypt(result[field]);
    }
  }
  return result;
}

/**
 * Mask a decrypted PII value for display (show only last 4 chars).
 */
export function maskPII(value: string | null | undefined): string {
  if (!value) return '****';
  if (value.length <= 4) return '****';
  return '*'.repeat(value.length - 4) + value.slice(-4);
}
