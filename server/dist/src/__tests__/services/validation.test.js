"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const validation_1 = require("../../middleware/validation");
describe('Validation Schemas', () => {
    describe('registerSchema', () => {
        it('should accept valid registration data', () => {
            const data = {
                email: 'test@example.com',
                password: 'Password1',
                firstName: 'Test',
                lastName: 'User',
            };
            expect(() => validation_1.registerSchema.parse(data)).not.toThrow();
        });
        it('should reject invalid email', () => {
            const data = { email: 'not-email', password: 'Password1', firstName: 'Test', lastName: 'User' };
            expect(() => validation_1.registerSchema.parse(data)).toThrow(zod_1.ZodError);
        });
        it('should reject short password', () => {
            const data = { email: 'test@example.com', password: 'short', firstName: 'Test', lastName: 'User' };
            expect(() => validation_1.registerSchema.parse(data)).toThrow(zod_1.ZodError);
        });
        it('should reject password without uppercase', () => {
            const data = { email: 'test@example.com', password: 'password1', firstName: 'Test', lastName: 'User' };
            expect(() => validation_1.registerSchema.parse(data)).toThrow(zod_1.ZodError);
        });
        it('should reject password without number', () => {
            const data = { email: 'test@example.com', password: 'Password', firstName: 'Test', lastName: 'User' };
            expect(() => validation_1.registerSchema.parse(data)).toThrow(zod_1.ZodError);
        });
        it('should accept optional fields', () => {
            const data = {
                email: 'test@example.com',
                password: 'Password1',
                firstName: 'Test',
                lastName: 'User',
                phone: '9876543210',
                state: 'Maharashtra',
                income: 200000,
            };
            const result = validation_1.registerSchema.parse(data);
            expect(result.phone).toBe('9876543210');
            expect(result.state).toBe('Maharashtra');
        });
    });
    describe('loginSchema', () => {
        it('should accept valid login data', () => {
            expect(() => validation_1.loginSchema.parse({ email: 'a@b.com', password: 'pass' })).not.toThrow();
        });
        it('should reject missing password', () => {
            expect(() => validation_1.loginSchema.parse({ email: 'a@b.com' })).toThrow(zod_1.ZodError);
        });
    });
    describe('applicationSubmitSchema', () => {
        it('should accept valid application', () => {
            const data = { schemeId: 'scheme-123', applicationData: { name: 'Test' } };
            expect(() => validation_1.applicationSubmitSchema.parse(data)).not.toThrow();
        });
        it('should reject missing schemeId', () => {
            expect(() => validation_1.applicationSubmitSchema.parse({ applicationData: {} })).toThrow(zod_1.ZodError);
        });
        it('should default applicationData to empty object', () => {
            const result = validation_1.applicationSubmitSchema.parse({ schemeId: 'abc' });
            expect(result.applicationData).toEqual({});
        });
    });
    describe('profileUpdateSchema', () => {
        it('should accept partial profile update', () => {
            expect(() => validation_1.profileUpdateSchema.parse({ firstName: 'Updated' })).not.toThrow();
        });
        it('should validate aadhar format', () => {
            expect(() => validation_1.profileUpdateSchema.parse({ aadharNumber: '123' })).toThrow(zod_1.ZodError);
            expect(() => validation_1.profileUpdateSchema.parse({ aadharNumber: '123456789012' })).not.toThrow();
        });
        it('should validate PAN format', () => {
            expect(() => validation_1.profileUpdateSchema.parse({ panNumber: 'ABC' })).toThrow(zod_1.ZodError);
            expect(() => validation_1.profileUpdateSchema.parse({ panNumber: 'ABCDE1234F' })).not.toThrow();
        });
    });
    describe('applicationReviewSchema', () => {
        it('should accept valid review', () => {
            expect(() => validation_1.applicationReviewSchema.parse({ status: 'APPROVED' })).not.toThrow();
            expect(() => validation_1.applicationReviewSchema.parse({ status: 'REJECTED', rejectionReason: 'Not eligible' })).not.toThrow();
        });
        it('should reject invalid status', () => {
            expect(() => validation_1.applicationReviewSchema.parse({ status: 'INVALID' })).toThrow(zod_1.ZodError);
        });
    });
});
