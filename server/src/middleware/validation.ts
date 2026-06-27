import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { z } from 'zod';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On failure, returns a 400 with structured error details.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || (error as any).errors || [];
        const details = issues.map((e: any) => ({
          field: (e.path || []).join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details,
          requestId: (req as any).requestId,
        });
      }
      next(error);
    }
  };
};

// ─── AUTH SCHEMAS ──────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Valid email is required').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().min(10).max(15).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  income: z.union([z.number(), z.string().transform(Number)]).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// ─── APPLICATION SCHEMAS ──────────────────────────────────────

export const applicationSubmitSchema = z.object({
  schemeId: z.string().min(1, 'Scheme ID is required'),
  applicationData: z.record(z.string(), z.any()).optional().default({}),
  documents: z.array(z.any()).optional().default([]),
});

export const applicationUpdateSchema = z.object({
  applicationData: z.record(z.string(), z.any()).optional(),
  documents: z.array(z.any()).optional(),
});

// ─── ELIGIBILITY SCHEMAS ──────────────────────────────────────

export const eligibilityCheckSchema = z.object({
  schemeId: z.string().min(1, 'Scheme ID is required'),
});

export const eligibilityCheckAllSchema = z.object({
  userId: z.string().min(1).optional(),
});

export const aiEligibilitySchema = z.object({
  personalInfo: z.object({
    age: z.union([z.number(), z.string().transform(Number)]).optional(),
    state: z.string().optional(),
    familySize: z.union([z.number(), z.string().transform(Number)]).optional(),
    education: z.string().optional(),
    occupation: z.string().optional(),
  }).optional(),
  financialInfo: z.object({
    income: z.union([z.number(), z.string().transform(Number)]).optional(),
  }).optional(),
  additionalInfo: z.object({
    disability: z.string().optional(),
    veteranStatus: z.string().optional(),
    caste: z.string().optional(),
  }).optional(),
  userId: z.string().optional(),
});

// ─── PROFILE SCHEMAS ──────────────────────────────────────────

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).max(15).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  aadharNumber: z.string().length(12, 'Aadhar must be 12 digits').optional().nullable(),
  panNumber: z.string().length(10, 'PAN must be 10 characters').optional().nullable(),
  income: z.union([z.number(), z.string().transform(Number)]).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  education: z.string().max(100).optional().nullable(),
  familySize: z.union([z.number().int(), z.string().transform(Number)]).optional().nullable(),
  disability: z.string().max(200).optional().nullable(),
  veteranStatus: z.string().max(100).optional().nullable(),
});

// ─── ADMIN SCHEMAS ────────────────────────────────────────────

export const schemeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Department is required'),
  benefits: z.string().min(1, 'Benefits is required'),
  eligibilityCriteria: z.string().min(1, 'Eligibility criteria is required'),
  applicationProcess: z.string().min(1, 'Application process is required'),
  requiredDocuments: z.string().min(1, 'Required documents is required'),
  sourceUrl: z.string().url().optional().nullable(),
  incomeLimit: z.number().optional().nullable(),
  ageLimit: z.string().optional().nullable(),
  familySizeLimit: z.number().int().optional().nullable(),
  disabilityCriteria: z.string().optional().nullable(),
  veteranCriteria: z.string().optional().nullable(),
  educationCriteria: z.string().optional().nullable(),
  occupationCriteria: z.string().optional().nullable(),
  stateSpecific: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const schemeUpdateSchema = schemeCreateSchema.partial();

export const applicationReviewSchema = z.object({
  status: z.enum(['REVIEWED', 'APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

// Re-export z for convenience
export { z };
