import { ZodError } from 'zod';
import {
  registerSchema,
  loginSchema,
  applicationSubmitSchema,
  profileUpdateSchema,
  eligibilityCheckSchema,
  schemeCreateSchema,
  applicationReviewSchema,
} from '../../middleware/validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'Test',
        lastName: 'User',
      };
      expect(() => registerSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const data = { email: 'not-email', password: 'Password1', firstName: 'Test', lastName: 'User' };
      expect(() => registerSchema.parse(data)).toThrow(ZodError);
    });

    it('should reject short password', () => {
      const data = { email: 'test@example.com', password: 'short', firstName: 'Test', lastName: 'User' };
      expect(() => registerSchema.parse(data)).toThrow(ZodError);
    });

    it('should reject password without uppercase', () => {
      const data = { email: 'test@example.com', password: 'password1', firstName: 'Test', lastName: 'User' };
      expect(() => registerSchema.parse(data)).toThrow(ZodError);
    });

    it('should reject password without number', () => {
      const data = { email: 'test@example.com', password: 'Password', firstName: 'Test', lastName: 'User' };
      expect(() => registerSchema.parse(data)).toThrow(ZodError);
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
      const result = registerSchema.parse(data);
      expect(result.phone).toBe('9876543210');
      expect(result.state).toBe('Maharashtra');
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      expect(() => loginSchema.parse({ email: 'a@b.com', password: 'pass' })).not.toThrow();
    });

    it('should reject missing password', () => {
      expect(() => loginSchema.parse({ email: 'a@b.com' })).toThrow(ZodError);
    });
  });

  describe('applicationSubmitSchema', () => {
    it('should accept valid application', () => {
      const data = { schemeId: 'scheme-123', applicationData: { name: 'Test' } };
      expect(() => applicationSubmitSchema.parse(data)).not.toThrow();
    });

    it('should reject missing schemeId', () => {
      expect(() => applicationSubmitSchema.parse({ applicationData: {} })).toThrow(ZodError);
    });

    it('should default applicationData to empty object', () => {
      const result = applicationSubmitSchema.parse({ schemeId: 'abc' });
      expect(result.applicationData).toEqual({});
    });
  });

  describe('profileUpdateSchema', () => {
    it('should accept partial profile update', () => {
      expect(() => profileUpdateSchema.parse({ firstName: 'Updated' })).not.toThrow();
    });

    it('should validate aadhar format', () => {
      expect(() => profileUpdateSchema.parse({ aadharNumber: '123' })).toThrow(ZodError);
      expect(() => profileUpdateSchema.parse({ aadharNumber: '123456789012' })).not.toThrow();
    });

    it('should validate PAN format', () => {
      expect(() => profileUpdateSchema.parse({ panNumber: 'ABC' })).toThrow(ZodError);
      expect(() => profileUpdateSchema.parse({ panNumber: 'ABCDE1234F' })).not.toThrow();
    });
  });

  describe('applicationReviewSchema', () => {
    it('should accept valid review', () => {
      expect(() => applicationReviewSchema.parse({ status: 'APPROVED' })).not.toThrow();
      expect(() => applicationReviewSchema.parse({ status: 'REJECTED', rejectionReason: 'Not eligible' })).not.toThrow();
    });

    it('should reject invalid status', () => {
      expect(() => applicationReviewSchema.parse({ status: 'INVALID' })).toThrow(ZodError);
    });
  });
});
