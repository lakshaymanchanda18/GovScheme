# GovScheme - Comprehensive Implementation Plan for Claude Opus 4.6

## Project Context

**Project Name:** GovScheme - Government Schemes Discovery & Application Platform  
**Tech Stack:** 
- Frontend: React 18, TypeScript, MUI, Vite
- Backend: Express, TypeScript, Prisma, SQLite (needs PostgreSQL migration)
- Deployment: Node.js

**Current Status:** 
- Basic CRUD operations working
- Authentication implemented
- Frontend components created (many non-functional)
- Backend APIs partially implemented
- Database schema defined

**Repository:** `d:\GovScheme` (Windows path: `/d/GovScheme` in WSL)

---

## Phase 1: Backend Stability & API Completion (Priority: CRITICAL)

### 1.1 Input Validation & Error Handling

**What to do:**
- Install and implement Zod for schema validation across all endpoints
- Create standardized error response format
- Add validation middleware for all POST/PUT requests
- Implement proper HTTP status codes

**Files to modify/create:**
- `server/src/middleware/validation.ts` (new)
- `server/src/utils/errors.ts` (new)
- `server/src/routes/*.ts` (all route files - add validation)
- `server/src/index.ts` (add validation middleware)

**Specific tasks:**
1. Create validation schemas for:
   - User registration/login
   - Application submission
   - Eligibility checks
   - Profile updates

2. Create custom error classes:
   - ValidationError
   - AuthenticationError
   - AuthorizationError
   - NotFoundError
   - ConflictError

3. Add error handling middleware:
   - Catch all validation errors
   - Return consistent error format: `{ error: string, code: string, details?: any }`
   - Include request ID in all error responses

**Dependencies to add:**
```json
{
  "zod": "^3.22.0",
  "zod-validation-error": "^2.0.0"
}
```

---

### 1.2 Document Upload & File Management

**What to do:**
- Implement secure document upload endpoint
- Add file type validation (PDF, JPG, PNG only)
- Add file size limits (5MB per file)
- Implement proper storage strategy
- Add malware scanning consideration

**Files to create:**
- `server/src/routes/documents.ts` (new)
- `server/src/services/fileStorage.ts` (new)
- `server/src/middleware/multer.ts` (new)
- Update Prisma schema to include document metadata

**Prisma Schema Updates:**
```prisma
model Document {
  id            String    @id @default(cuid())
  userId        String
  applicationId String?
  fileName      String
  fileSize      Int
  mimeType      String
  uploadedAt    DateTime  @default(now())
  url           String
  verified      Boolean   @default(false)
  user          User      @relation(fields: [userId], references: [id])
  application   Application? @relation(fields: [applicationId], references: [id])
  @@map("documents")
}
```

**Specific endpoints:**
- `POST /api/documents/upload` - Upload file
- `GET /api/documents/:id` - Download file (with auth)
- `DELETE /api/documents/:id` - Delete file
- `GET /api/applications/:id/documents` - List application documents

---

### 1.3 Email Notification Service

**What to do:**
- Implement email service using NodeMailer
- Create email templates for different events
- Add queue for reliable email delivery
- Implement email retry logic

**Files to create:**
- `server/src/services/email.ts` (enhance existing)
- `server/src/templates/emails/*.html` (new folder with templates)
- `server/src/services/emailQueue.ts` (new)

**Email Templates to create:**
1. Welcome email (registration)
2. Email verification
3. Application submitted confirmation
4. Application status update (approved/rejected)
5. Eligibility notification
6. Password reset

**Integration points:**
- Send welcome email after user registration
- Send confirmation after application submission
- Send status updates when application status changes
- Send eligibility notifications

**Dependencies:**
```json
{
  "nodemailer": "^6.9.7",
  "handlebars": "^4.7.7"
}
```

---

### 1.4 Complete Eligibility Check Endpoint

**What to do:**
- Implement comprehensive eligibility scoring algorithm
- Add explainable AI output (show why user is/isn't eligible)
- Create eligibility explanation response
- Add caching for eligibility checks

**Files to modify:**
- `server/src/services/eligibilityChecker.ts` (enhance)
- `server/src/routes/eligibility.ts` (complete implementation)

**Eligibility Logic:**
```
For each scheme, check:
1. Age criteria (if applicable)
2. Income criteria (if applicable)
3. State/region (if applicable)
4. Education level (if applicable)
5. Occupation (if applicable)
6. Disability status (if applicable)
7. Family size (if applicable)
8. Caste/SC/ST (if applicable)

Return:
{
  schemeId: string
  schemeName: string
  isEligible: boolean
  confidenceScore: 0-100 (percentage)
  matchedCriteria: [{ criteria: string, userValue: any, schemeValue: any }]
  unmatchedCriteria: [{ criteria: string, reason: string }]
  explanation: string (human-readable explanation)
}
```

**Endpoint:**
```
POST /api/eligibility/check
Body: { userId: string }
Response: {
  totalSchemes: number
  eligibleSchemes: number
  schemes: EligibilityResult[]
  topRecommendations: EligibilityResult[] (top 5)
}
```

---

### 1.5 Application Submission Complete Flow

**What to do:**
- Complete application submission endpoint
- Add application status workflow
- Implement application retrieval endpoints
- Add application filtering/search

**Files to modify:**
- `server/src/routes/applications.ts` (complete all endpoints)

**Endpoints to implement:**
```
POST /api/applications
- Submit new application
- Validate all required documents
- Create application status update
- Send confirmation email

GET /api/applications
- List user's applications with filters
- Filter by status, scheme, date range

GET /api/applications/:id
- Get application details with documents and history

PUT /api/applications/:id
- Update draft application
- Only if status is DRAFT

GET /api/applications/:id/history
- Get application status history
```

---

### 1.6 API Documentation

**What to do:**
- Add Swagger/OpenAPI documentation
- Document all endpoints with examples
- Add request/response schemas

**Files to create:**
- `server/src/swagger.ts` (new)
- `server/src/openapi.json` (new)

**Dependencies:**
```json
{
  "swagger-ui-express": "^5.0.0",
  "swagger-jsdoc": "^6.2.8"
}
```

**Endpoint:** `GET /api-docs` - Swagger UI

---

## Phase 2: Frontend Integration & User Experience (Priority: HIGH)

### 2.1 Connect All Forms to Backend

**What to do:**
- Complete registration form integration
- Complete login form integration
- Complete application form integration
- Add proper error handling & validation feedback
- Add loading states & success messages

**Files to modify:**
- `client/src/components/RegisterPage.tsx`
- `client/src/components/LoginPage.tsx`
- `client/src/components/ApplicationForm.tsx`
- `client/src/components/GuidedApplicationForm.tsx`

**Specific requirements:**
1. RegisterPage:
   - Validate email format
   - Validate password strength
   - Show loading spinner during submission
   - Show success message
   - Redirect to login on success
   - Handle duplicate email error

2. LoginPage:
   - Store JWT token in httpOnly cookie
   - Implement "remember me" functionality
   - Add password reset link
   - Show session timeout warning

3. ApplicationForm:
   - Add file upload for documents
   - Validate required fields
   - Show progress indicator
   - Save draft functionality
   - Add confirmation before submission

---

### 2.2 Authentication Token Management

**What to do:**
- Implement token refresh mechanism
- Add automatic logout on token expiration
- Add session timeout warnings
- Improve token security

**Files to modify:**
- `client/src/hooks/useAuth.ts`
- `client/src/contexts/AuthContext.tsx`
- `client/src/hooks/useApi.ts`

**Specific implementation:**
1. Add refresh token endpoint in backend:
   ```
   POST /api/auth/refresh
   Response: { token: string }
   ```

2. Implement automatic token refresh:
   - Check token expiration before each API call
   - Refresh if expiring within 5 minutes
   - Handle refresh failures

3. Add session management:
   - Show warning 2 minutes before expiry
   - Offer option to extend session
   - Auto-logout after expiry

---

### 2.3 Loading States & Error Handling

**What to do:**
- Add loading spinners for all API calls
- Add error toasts/alerts
- Add skeleton loaders for data
- Implement retry logic for failed requests

**Files to create/modify:**
- `client/src/components/LoadingSpinner.tsx` (enhance)
- `client/src/components/ErrorBoundary.tsx` (new)
- `client/src/hooks/useApi.ts` (enhance)

**Implementation:**
1. Create reusable error display component
2. Add error toast notifications
3. Add retry buttons for failed requests
4. Show user-friendly error messages

---

### 2.4 Dashboard Completion

**What to do:**
- Complete dashboard with real data
- Add application status cards
- Add scheme recommendations
- Add quick actions

**Files to modify:**
- `client/src/components/DashboardPage.tsx`

**Dashboard sections:**
1. Summary Cards:
   - Total eligible schemes
   - Applications (Pending/Approved/Rejected)
   - Saved for later count

2. Recent Applications List:
   - Show last 5 applications
   - Status, scheme name, submission date
   - Quick action buttons

3. Recommendations:
   - Top 5 eligible schemes
   - Eligibility score
   - Apply button

---

## Phase 3: Database & Scalability (Priority: HIGH)

### 3.1 Migrate from SQLite to PostgreSQL

**What to do:**
- Update database connection
- Update Prisma configuration
- Create migration scripts
- Add connection pooling

**Files to modify:**
- `prisma/schema.prisma` (change provider to postgresql)
- `server/.env` (update DATABASE_URL)
- `server/src/config/prisma.ts` (add connection pooling)

**Configuration:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/govscheme"
```

**Dependencies:**
```json
{
  "pg": "^8.11.0"
}
```

---

### 3.2 Add Redis Caching

**What to do:**
- Implement Redis for caching frequently accessed data
- Cache scheme listings
- Cache eligibility checks
- Add cache invalidation strategy

**Files to create:**
- `server/src/services/redis.ts` (new)
- `server/src/middleware/cache.ts` (new)

**Cache strategy:**
1. Scheme data - 1 hour TTL
2. Eligibility checks - 24 hours TTL
3. User profile - 30 minutes TTL
4. Analytics data - 10 minutes TTL

**Endpoints to cache:**
- `GET /api/schemes` (all schemes)
- `GET /api/schemes/:id` (single scheme)
- `GET /api/dashboard/stats` (user stats)

---

### 3.3 Database Optimization

**What to do:**
- Add proper indexes to database
- Add database-level constraints
- Optimize N+1 queries
- Add query analytics

**Prisma schema updates:**
```prisma
model User {
  @@index([email])
  @@index([createdAt])
  @@index([state])
}

model GovernmentScheme {
  @@index([category])
  @@index([department])
  @@index([isActive])
}

model Application {
  @@index([userId])
  @@index([schemeId])
  @@index([status])
  @@index([submittedAt])
}

model EligibilityCheck {
  @@index([userId])
  @@index([schemeId])
  @@index([isEligible])
}
```

---

## Phase 4: Security Hardening (Priority: HIGH)

### 4.1 Two-Factor Authentication (2FA)

**What to do:**
- Add TOTP (Time-based One-Time Password) support
- Add SMS OTP backup
- Create 2FA setup flow
- Add recovery codes

**Files to create:**
- `server/src/services/2fa.ts` (new)
- `server/src/routes/auth.ts` (add 2FA endpoints)

**Dependencies:**
```json
{
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3"
}
```

**Prisma schema update:**
```prisma
model User {
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret String?
  recoveryCode String?
}
```

**Endpoints:**
```
POST /api/auth/2fa/setup - Get QR code
POST /api/auth/2fa/verify - Verify TOTP
POST /api/auth/2fa/backup-codes - Generate backup codes
POST /api/auth/login/verify-2fa - Verify 2FA during login
```

---

### 4.2 Data Encryption

**What to do:**
- Encrypt sensitive PII fields (Aadhar, PAN)
- Implement field-level encryption
- Add encryption key rotation strategy
- Encrypt documents at rest

**Files to create:**
- `server/src/services/encryption.ts` (new)

**Dependencies:**
```json
{
  "crypto": "^1.0.1"
}
```

**Fields to encrypt:**
- aadharNumber
- panNumber
- phone
- dateOfBirth
- income

---

### 4.3 Session Management & CSRF Protection

**What to do:**
- Implement proper session management
- Add CSRF tokens to all state-changing requests
- Implement rate limiting per user
- Add suspicious activity detection

**Files to create:**
- `server/src/middleware/csrf.ts` (new)
- `server/src/services/sessionManager.ts` (new)

**Implementation:**
1. Add session store (Redis-backed)
2. Generate CSRF tokens
3. Validate CSRF tokens on all POST/PUT/DELETE
4. Track user sessions
5. Implement session invalidation

---

## Phase 5: Testing & Quality Assurance (Priority: CRITICAL)

### 5.1 Backend Unit Tests

**What to do:**
- Add comprehensive unit tests for services
- Test eligibility logic
- Test validation logic
- Aim for 80%+ coverage

**Files to create:**
- `server/src/__tests__/services/eligibilityChecker.test.ts`
- `server/src/__tests__/services/validation.test.ts`
- `server/src/__tests__/middleware/auth.test.ts`

**Testing framework:**
```json
{
  "@jest/globals": "^29.7.0",
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1"
}
```

---

### 5.2 Integration Tests

**What to do:**
- Test complete user flows
- Test API endpoints with database
- Test authentication flows
- Test application submission flow

**Files to create:**
- `server/src/__tests__/integration/auth.test.ts`
- `server/src/__tests__/integration/applications.test.ts`
- `server/src/__tests__/integration/eligibility.test.ts`

**Test scenarios:**
1. User registration → Login → View eligibility → Submit application
2. Admin scheme management
3. Application status workflow
4. Error handling and validation

---

### 5.3 Frontend Testing

**What to do:**
- Add component unit tests
- Test form validation
- Test API integration
- Test accessibility

**Dependencies:**
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.4",
  "vitest": "^0.34.0"
}
```

---

## Phase 6: Admin Panel (Priority: MEDIUM)

### 6.1 Admin Authentication & Authorization

**What to do:**
- Implement role-based access control (RBAC)
- Create admin role
- Add permission checking middleware
- Implement admin login

**Files to create:**
- `server/src/middleware/authorization.ts` (new)
- `server/src/routes/admin-auth.ts` (new)

**Prisma schema update:**
```prisma
model User {
  role String @default("USER") // USER, ADMIN, SUPERADMIN
  permissions String[] // JSON array of permissions
}
```

**Admin endpoints:**
```
POST /api/admin/auth/login - Admin login
GET /api/admin/users - List all users
GET /api/admin/users/:id - Get user details
PUT /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Deactivate user
```

---

### 6.2 Scheme Management

**What to do:**
- Create scheme CRUD endpoints
- Add scheme validation
- Implement bulk import
- Add scheme status management

**Endpoints:**
```
POST /api/admin/schemes - Create new scheme
PUT /api/admin/schemes/:id - Update scheme
DELETE /api/admin/schemes/:id - Archive scheme
GET /api/admin/schemes - List all schemes with filters
POST /api/admin/schemes/bulk-import - Import schemes from CSV
```

---

### 6.3 Analytics Dashboard

**What to do:**
- Create analytics endpoints
- Add application statistics
- Add user statistics
- Add scheme performance metrics

**Endpoints:**
```
GET /api/admin/analytics/overview - Dashboard overview
GET /api/admin/analytics/applications - Application stats
GET /api/admin/analytics/users - User stats
GET /api/admin/analytics/schemes - Scheme popularity
GET /api/admin/analytics/reports - Generate reports
```

---

## Phase 7: Advanced Features (Priority: MEDIUM)

### 7.1 Real-time Notifications

**What to do:**
- Implement WebSocket support
- Add real-time application updates
- Add push notifications
- Add notification preferences

**Dependencies:**
```json
{
  "socket.io": "^4.7.0",
  "web-push": "^3.6.5"
}
```

---

### 7.2 PDF Generation

**What to do:**
- Generate application PDFs
- Create scheme information PDFs
- Generate reports

**Dependencies:**
```json
{
  "puppeteer": "^21.0.0",
  "pdfkit": "^0.13.0"
}
```

---

### 7.3 AI-Powered Eligibility (Claude API Integration)

**What to do:**
- Integrate Claude API for intelligent eligibility explanations
- Add RAG (Retrieval-Augmented Generation) for scheme matching
- Generate personalized recommendations

**Dependencies:**
```json
{
  "@anthropic-ai/sdk": "^0.7.0"
}
```

**Implementation:**
```
POST /api/eligibility/ai-check
- Use Claude to understand user profile
- Match with scheme requirements
- Generate personalized explanation
- Provide improvement suggestions
```

---

## Quality Checklist

Before considering implementation complete, verify:

- [ ] All endpoints have input validation
- [ ] All endpoints have error handling
- [ ] All sensitive data is encrypted
- [ ] Rate limiting is in place
- [ ] CORS is properly configured
- [ ] CSRF protection is implemented
- [ ] All tests pass (>80% coverage)
- [ ] API documentation is complete
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Database migrations work smoothly
- [ ] Logging is comprehensive
- [ ] Error messages are user-friendly
- [ ] Email notifications work
- [ ] File upload is secure
- [ ] Frontend forms are fully functional
- [ ] Authentication flow is complete
- [ ] Authorization checks are in place

---

## Dependency Summary (All Phases)

**Backend:**
```json
{
  "zod": "^3.22.0",
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3",
  "handlebars": "^4.7.7",
  "swagger-ui-express": "^5.0.0",
  "swagger-jsdoc": "^6.2.8",
  "pg": "^8.11.0",
  "redis": "^4.6.0",
  "socket.io": "^4.7.0",
  "puppeteer": "^21.0.0",
  "@anthropic-ai/sdk": "^0.7.0"
}
```

**Frontend:**
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.4",
  "vitest": "^0.34.0"
}
```

---

## Environment Variables Needed

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/govscheme"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="7d"
JWT_REFRESH_SECRET="refresh-secret"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@govscheme.com"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880

# 2FA
2FA_ISSUER="GovScheme"

# Claude API
CLAUDE_API_KEY="your-claude-api-key"

# AWS S3 (if using)
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_S3_BUCKET="govscheme"
AWS_REGION="us-east-1"

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://yourdomain.com"
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] Redis instance running
- [ ] SSL certificates configured
- [ ] CDN configured for static assets
- [ ] Email service configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented
- [ ] Auto-scaling configured
- [ ] Health checks setup
- [ ] Rate limiting tuned for production
- [ ] Database backups scheduled
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Admin panel secured

---

## Success Metrics

After implementation, the system should have:

✅ **Backend:**
- 100% endpoint functional completion
- 80%+ test coverage
- <100ms average API response time
- Zero critical security vulnerabilities

✅ **Frontend:**
- All forms fully functional
- 100% accessibility compliance (WCAG 2.1 AA)
- <3s page load time
- 95%+ Lighthouse score

✅ **Data:**
- Secure data storage and transmission
- All PII encrypted
- Complete audit trail
- GDPR compliant

✅ **User Experience:**
- Intuitive navigation
- Error messages clear and helpful
- Mobile responsive
- Accessible to all users

---

**Total estimated effort:** 3-4 months with one senior developer + one junior developer

**To start:** Begin with Phase 1 (Backend Stability) as it's the foundation for everything else.

