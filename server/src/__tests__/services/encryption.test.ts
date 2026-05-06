import { encrypt, decrypt, isEncrypted, encryptPII, decryptPII, maskPII } from '../../services/encryption';

describe('Encryption Service', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const original = '123456789012';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(original);
      expect(decrypted).toBe(original);
    });

    it('should produce different ciphertexts for the same plaintext', () => {
      const original = 'ABCDE1234F';
      const enc1 = encrypt(original);
      const enc2 = encrypt(original);

      expect(enc1).not.toBe(enc2); // Random IV
      expect(decrypt(enc1)).toBe(original);
      expect(decrypt(enc2)).toBe(original);
    });

    it('should return empty string for empty input', () => {
      expect(encrypt('')).toBe('');
      expect(decrypt('')).toBe('');
    });

    it('should handle null/undefined gracefully', () => {
      expect(encrypt(null as any)).toBeFalsy();
      expect(decrypt(null as any)).toBeFalsy();
    });
  });

  describe('isEncrypted', () => {
    it('should detect encrypted values', () => {
      const encrypted = encrypt('test-value');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should not flag plain values as encrypted', () => {
      expect(isEncrypted('123456789012')).toBe(false);
      expect(isEncrypted('ABCDE1234F')).toBe(false);
      expect(isEncrypted('')).toBe(false);
    });
  });

  describe('encryptPII/decryptPII', () => {
    it('should encrypt PII fields', () => {
      const data = {
        aadharNumber: '123456789012',
        panNumber: 'ABCDE1234F',
        firstName: 'Test',
      };

      const encrypted = encryptPII(data);
      expect(encrypted.aadharNumber).not.toBe('123456789012');
      expect(encrypted.panNumber).not.toBe('ABCDE1234F');
      expect(encrypted.firstName).toBe('Test'); // Not a PII field

      const decrypted = decryptPII(encrypted);
      expect(decrypted.aadharNumber).toBe('123456789012');
      expect(decrypted.panNumber).toBe('ABCDE1234F');
    });

    it('should not double-encrypt', () => {
      const data = { aadharNumber: '123456789012' };
      const enc1 = encryptPII(data);
      const enc2 = encryptPII(enc1);

      expect(decryptPII(enc2).aadharNumber).toBe('123456789012');
    });
  });

  describe('maskPII', () => {
    it('should mask all but last 4 characters', () => {
      expect(maskPII('123456789012')).toBe('********9012');
      expect(maskPII('ABCDE1234F')).toBe('******234F');
    });

    it('should return **** for short or null values', () => {
      expect(maskPII(null)).toBe('****');
      expect(maskPII('')).toBe('****');
      expect(maskPII('ab')).toBe('****');
    });
  });
});
