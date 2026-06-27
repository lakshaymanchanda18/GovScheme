"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encryption_1 = require("../../services/encryption");
describe('Encryption Service', () => {
    describe('encrypt/decrypt', () => {
        it('should encrypt and decrypt a string correctly', () => {
            const original = '123456789012';
            const encrypted = (0, encryption_1.encrypt)(original);
            const decrypted = (0, encryption_1.decrypt)(encrypted);
            expect(encrypted).not.toBe(original);
            expect(decrypted).toBe(original);
        });
        it('should produce different ciphertexts for the same plaintext', () => {
            const original = 'ABCDE1234F';
            const enc1 = (0, encryption_1.encrypt)(original);
            const enc2 = (0, encryption_1.encrypt)(original);
            expect(enc1).not.toBe(enc2); // Random IV
            expect((0, encryption_1.decrypt)(enc1)).toBe(original);
            expect((0, encryption_1.decrypt)(enc2)).toBe(original);
        });
        it('should return empty string for empty input', () => {
            expect((0, encryption_1.encrypt)('')).toBe('');
            expect((0, encryption_1.decrypt)('')).toBe('');
        });
        it('should handle null/undefined gracefully', () => {
            expect((0, encryption_1.encrypt)(null)).toBeFalsy();
            expect((0, encryption_1.decrypt)(null)).toBeFalsy();
        });
    });
    describe('isEncrypted', () => {
        it('should detect encrypted values', () => {
            const encrypted = (0, encryption_1.encrypt)('test-value');
            expect((0, encryption_1.isEncrypted)(encrypted)).toBe(true);
        });
        it('should not flag plain values as encrypted', () => {
            expect((0, encryption_1.isEncrypted)('123456789012')).toBe(false);
            expect((0, encryption_1.isEncrypted)('ABCDE1234F')).toBe(false);
            expect((0, encryption_1.isEncrypted)('')).toBe(false);
        });
    });
    describe('encryptPII/decryptPII', () => {
        it('should encrypt PII fields', () => {
            const data = {
                aadharNumber: '123456789012',
                panNumber: 'ABCDE1234F',
                firstName: 'Test',
            };
            const encrypted = (0, encryption_1.encryptPII)(data);
            expect(encrypted.aadharNumber).not.toBe('123456789012');
            expect(encrypted.panNumber).not.toBe('ABCDE1234F');
            expect(encrypted.firstName).toBe('Test'); // Not a PII field
            const decrypted = (0, encryption_1.decryptPII)(encrypted);
            expect(decrypted.aadharNumber).toBe('123456789012');
            expect(decrypted.panNumber).toBe('ABCDE1234F');
        });
        it('should not double-encrypt', () => {
            const data = { aadharNumber: '123456789012' };
            const enc1 = (0, encryption_1.encryptPII)(data);
            const enc2 = (0, encryption_1.encryptPII)(enc1);
            expect((0, encryption_1.decryptPII)(enc2).aadharNumber).toBe('123456789012');
        });
    });
    describe('maskPII', () => {
        it('should mask all but last 4 characters', () => {
            expect((0, encryption_1.maskPII)('123456789012')).toBe('********9012');
            expect((0, encryption_1.maskPII)('ABCDE1234F')).toBe('******234F');
        });
        it('should return **** for short or null values', () => {
            expect((0, encryption_1.maskPII)(null)).toBe('****');
            expect((0, encryption_1.maskPII)('')).toBe('****');
            expect((0, encryption_1.maskPII)('ab')).toBe('****');
        });
    });
});
