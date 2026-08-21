"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = exports.applicationReviewSchema = exports.schemeUpdateSchema = exports.schemeCreateSchema = exports.profileUpdateSchema = exports.aiEligibilitySchema = exports.eligibilityCheckAllSchema = exports.eligibilityCheckSchema = exports.applicationUpdateSchema = exports.applicationSubmitSchema = exports.loginSchema = exports.registerSchema = exports.validate = void 0;
const zod_1 = require("zod");
const zod_2 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_2.z; } });
/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On failure, returns a 400 with structured error details.
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const issues = error.issues || error.errors || [];
                const details = issues.map((e) => ({
                    field: (e.path || []).join('.'),
                    message: e.message,
                }));
                return res.status(400).json({
                    error: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details,
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    };
};
exports.validate = validate;
// ─── AUTH SCHEMAS ──────────────────────────────────────────────
exports.registerSchema = zod_2.z.object({
    email: zod_2.z.string().email('Valid email is required').trim().toLowerCase(),
    password: zod_2.z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: zod_2.z.string().min(1, 'First name is required').max(100),
    lastName: zod_2.z.string().min(1, 'Last name is required').max(100),
    phone: zod_2.z.string().min(10).max(15).optional().nullable(),
    state: zod_2.z.string().max(100).optional().nullable(),
    city: zod_2.z.string().max(100).optional().nullable(),
    occupation: zod_2.z.string().max(100).optional().nullable(),
    income: zod_2.z.union([zod_2.z.number(), zod_2.z.string().transform(Number)]).optional().nullable(),
});
exports.loginSchema = zod_2.z.object({
    email: zod_2.z.string().email('Valid email is required').trim().toLowerCase(),
    password: zod_2.z.string().min(1, 'Password is required'),
});
// ─── APPLICATION SCHEMAS ──────────────────────────────────────
exports.applicationSubmitSchema = zod_2.z.object({
    schemeId: zod_2.z.string().min(1, 'Scheme ID is required'),
    applicationData: zod_2.z.record(zod_2.z.string(), zod_2.z.any()).optional().default({}),
    documents: zod_2.z.array(zod_2.z.any()).optional().default([]),
});
exports.applicationUpdateSchema = zod_2.z.object({
    applicationData: zod_2.z.record(zod_2.z.string(), zod_2.z.any()).optional(),
    documents: zod_2.z.array(zod_2.z.any()).optional(),
});
// ─── ELIGIBILITY SCHEMAS ──────────────────────────────────────
exports.eligibilityCheckSchema = zod_2.z.object({
    schemeId: zod_2.z.string().min(1, 'Scheme ID is required'),
});
exports.eligibilityCheckAllSchema = zod_2.z.object({
    userId: zod_2.z.string().min(1).optional(),
});
exports.aiEligibilitySchema = zod_2.z.object({
    personalInfo: zod_2.z.object({
        age: zod_2.z.union([zod_2.z.number(), zod_2.z.string().transform(Number)]).optional(),
        state: zod_2.z.string().optional(),
        familySize: zod_2.z.union([zod_2.z.number(), zod_2.z.string().transform(Number)]).optional(),
        education: zod_2.z.string().optional(),
        occupation: zod_2.z.string().optional(),
    }).optional(),
    financialInfo: zod_2.z.object({
        income: zod_2.z.union([zod_2.z.number(), zod_2.z.string().transform(Number)]).optional(),
    }).optional(),
    additionalInfo: zod_2.z.object({
        disability: zod_2.z.string().optional(),
        veteranStatus: zod_2.z.string().optional(),
        caste: zod_2.z.string().optional(),
    }).optional(),
    userId: zod_2.z.string().optional(),
});
// ─── PROFILE SCHEMAS ──────────────────────────────────────────
exports.profileUpdateSchema = zod_2.z.object({
    firstName: zod_2.z.string().min(1).max(100).optional(),
    lastName: zod_2.z.string().min(1).max(100).optional(),
    phone: zod_2.z.string().min(10).max(15).optional().nullable(),
    dateOfBirth: zod_2.z.string().optional().nullable(),
    address: zod_2.z.string().max(500).optional().nullable(),
    city: zod_2.z.string().max(100).optional().nullable(),
    state: zod_2.z.string().max(100).optional().nullable(),
    pincode: zod_2.z.string().max(10).optional().nullable(),
    aadharNumber: zod_2.z.string().length(12, 'Aadhar must be 12 digits').optional().nullable(),
    panNumber: zod_2.z.string().length(10, 'PAN must be 10 characters').optional().nullable(),
    income: zod_2.z.union([zod_2.z.number(), zod_2.z.string().transform(Number)]).optional().nullable(),
    occupation: zod_2.z.string().max(100).optional().nullable(),
    education: zod_2.z.string().max(100).optional().nullable(),
    familySize: zod_2.z.union([zod_2.z.number().int(), zod_2.z.string().transform(Number)]).optional().nullable(),
    disability: zod_2.z.string().max(200).optional().nullable(),
    veteranStatus: zod_2.z.string().max(100).optional().nullable(),
});
// ─── ADMIN SCHEMAS ────────────────────────────────────────────
exports.schemeCreateSchema = zod_2.z.object({
    name: zod_2.z.string().min(1, 'Name is required').max(500),
    description: zod_2.z.string().min(1, 'Description is required'),
    category: zod_2.z.string().min(1, 'Category is required'),
    department: zod_2.z.string().min(1, 'Department is required'),
    benefits: zod_2.z.string().min(1, 'Benefits is required'),
    eligibilityCriteria: zod_2.z.string().min(1, 'Eligibility criteria is required'),
    applicationProcess: zod_2.z.string().min(1, 'Application process is required'),
    requiredDocuments: zod_2.z.string().min(1, 'Required documents is required'),
    sourceUrl: zod_2.z.string().url().optional().nullable(),
    incomeLimit: zod_2.z.number().optional().nullable(),
    ageLimit: zod_2.z.string().optional().nullable(),
    familySizeLimit: zod_2.z.number().int().optional().nullable(),
    disabilityCriteria: zod_2.z.string().optional().nullable(),
    veteranCriteria: zod_2.z.string().optional().nullable(),
    educationCriteria: zod_2.z.string().optional().nullable(),
    occupationCriteria: zod_2.z.string().optional().nullable(),
    stateSpecific: zod_2.z.string().optional().nullable(),
    isActive: zod_2.z.boolean().optional().default(true),
});
exports.schemeUpdateSchema = exports.schemeCreateSchema.partial();
exports.applicationReviewSchema = zod_2.z.object({
    status: zod_2.z.enum(['REVIEWED', 'APPROVED', 'REJECTED']),
    rejectionReason: zod_2.z.string().optional(),
});
