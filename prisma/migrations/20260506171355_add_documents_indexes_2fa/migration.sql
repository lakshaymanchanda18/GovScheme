-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" DATETIME,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "aadharNumber" TEXT,
    "panNumber" TEXT,
    "income" DECIMAL,
    "occupation" TEXT,
    "education" TEXT,
    "familySize" INTEGER,
    "disability" TEXT,
    "veteranStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "recoveryCodes" TEXT
);
INSERT INTO "new_users" ("aadharNumber", "address", "city", "createdAt", "dateOfBirth", "disability", "education", "email", "familySize", "firstName", "id", "income", "isActive", "lastName", "occupation", "panNumber", "password", "phone", "pincode", "role", "state", "updatedAt", "veteranStatus") SELECT "aadharNumber", "address", "city", "createdAt", "dateOfBirth", "disability", "education", "email", "familySize", "firstName", "id", "income", "isActive", "lastName", "occupation", "panNumber", "password", "phone", "pincode", "role", "state", "updatedAt", "veteranStatus" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_state_idx" ON "users"("state");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "documents_applicationId_idx" ON "documents"("applicationId");

-- CreateIndex
CREATE INDEX "application_status_updates_applicationId_idx" ON "application_status_updates"("applicationId");

-- CreateIndex
CREATE INDEX "applications_userId_idx" ON "applications"("userId");

-- CreateIndex
CREATE INDEX "applications_schemeId_idx" ON "applications"("schemeId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_submittedAt_idx" ON "applications"("submittedAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "eligibility_checks_userId_idx" ON "eligibility_checks"("userId");

-- CreateIndex
CREATE INDEX "eligibility_checks_schemeId_idx" ON "eligibility_checks"("schemeId");

-- CreateIndex
CREATE INDEX "eligibility_checks_isEligible_idx" ON "eligibility_checks"("isEligible");

-- CreateIndex
CREATE INDEX "government_schemes_category_idx" ON "government_schemes"("category");

-- CreateIndex
CREATE INDEX "government_schemes_department_idx" ON "government_schemes"("department");

-- CreateIndex
CREATE INDEX "government_schemes_isActive_idx" ON "government_schemes"("isActive");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
