/**
 * OpenAPI/Swagger documentation for all API endpoints.
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SaralYojna API',
      version: '2.0.0',
      description: 'Government Schemes Discovery & Application Platform API',
      contact: {
        name: 'Lakshay Manchanda',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
            requestId: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            phone: { type: 'string' },
            state: { type: 'string' },
            city: { type: 'string' },
            occupation: { type: 'string' },
            income: { type: 'number' },
            education: { type: 'string' },
            familySize: { type: 'integer' },
          },
        },
        Scheme: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            department: { type: 'string' },
            benefits: { type: 'string' },
            eligibilityCriteria: { type: 'string' },
            applicationProcess: { type: 'string' },
            requiredDocuments: { type: 'string' },
            incomeLimit: { type: 'number' },
            ageLimit: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            schemeId: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'] },
            submittedAt: { type: 'string', format: 'date-time' },
            applicationData: { type: 'object' },
            documents: { type: 'array' },
          },
        },
        EligibilityResult: {
          type: 'object',
          properties: {
            schemeId: { type: 'string' },
            schemeName: { type: 'string' },
            isEligible: { type: 'boolean' },
            confidenceScore: { type: 'number', minimum: 0, maximum: 100 },
            matchedCriteria: { type: 'array' },
            unmatchedCriteria: { type: 'array' },
            explanation: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            originalName: { type: 'string' },
            mimeType: { type: 'string' },
            fileSize: { type: 'integer' },
            uploadedAt: { type: 'string', format: 'date-time' },
            verified: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: { '200': { description: 'Server is healthy' } },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'firstName', 'lastName'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phone: { type: 'string' },
                    state: { type: 'string' },
                    city: { type: 'string' },
                    occupation: { type: 'string' },
                    income: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'User registered successfully' },
            '400': { description: 'Validation error' },
            '409': { description: 'Email already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/logout': {
        post: { tags: ['Authentication'], summary: 'Logout and clear session', responses: { '200': { description: 'Logged out' } } },
      },
      '/api/auth/profile': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user profile',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'User profile' }, '401': { description: 'Not authenticated' } },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh authentication token',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'Token refreshed' } },
        },
      },
      '/api/schemes': {
        get: {
          tags: ['Schemes'],
          summary: 'List all active schemes',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'department', in: 'query', schema: { type: 'string' } },
            { name: 'state', in: 'query', schema: { type: 'string' } },
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' },
          ],
          responses: { '200': { description: 'List of schemes' } },
        },
      },
      '/api/schemes/{id}': {
        get: {
          tags: ['Schemes'],
          summary: 'Get scheme details',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Scheme details' }, '404': { description: 'Not found' } },
        },
      },
      '/api/applications': {
        get: {
          tags: ['Applications'],
          summary: 'List user applications',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'List of applications' } },
        },
        post: {
          tags: ['Applications'],
          summary: 'Submit a new application',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['schemeId'],
                  properties: {
                    schemeId: { type: 'string' },
                    applicationData: { type: 'object' },
                    documents: { type: 'array' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Application submitted' }, '400': { description: 'Validation error' } },
        },
      },
      '/api/eligibility/check': {
        post: {
          tags: ['Eligibility'],
          summary: 'Check eligibility for a single scheme',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { schemeId: { type: 'string' } } } } },
          },
          responses: { '200': { description: 'Eligibility result' } },
        },
      },
      '/api/eligibility/check-all': {
        post: {
          tags: ['Eligibility'],
          summary: 'Check eligibility against all active schemes',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'Bulk eligibility results' } },
        },
      },
      '/api/eligibility/ai-check': {
        post: {
          tags: ['Eligibility'],
          summary: 'AI-powered eligibility check using Gemini',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    personalInfo: { type: 'object', properties: { age: { type: 'number' }, state: { type: 'string' }, education: { type: 'string' } } },
                    financialInfo: { type: 'object', properties: { income: { type: 'number' } } },
                    userId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'AI eligibility result with personalized explanation' } },
        },
      },
      '/api/documents/upload': {
        post: {
          tags: ['Documents'],
          summary: 'Upload a document',
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, applicationId: { type: 'string' } } } } },
          },
          responses: { '201': { description: 'Document uploaded' }, '400': { description: 'Invalid file' } },
        },
      },
      '/api/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get user dashboard statistics',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'Dashboard stats' } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SaralYojna API Documentation',
  }));
}

export { swaggerSpec };
