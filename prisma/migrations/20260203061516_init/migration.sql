CREATE TABLE "sites" (
    "id" UUID NOT NULL,
    "siteIdCode" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "locationAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT,
    "workStartTime" TIME,
    "workEndTime" TIME,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attendance_logs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "attendanceDate" DATE NOT NULL,
    "timeIn" TIMESTAMP(3),
    "timeOut" TIMESTAMP(3),
    "loggedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attendance_evidence" (
    "id" UUID NOT NULL,
    "attendanceId" UUID NOT NULL,
    "uploadedByUserId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageHash" TEXT,
    "imageType" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedByUserId" UUID,
    "deletionReason" TEXT,

    CONSTRAINT "attendance_evidence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sites_siteIdCode_key" ON "sites"("siteIdCode");

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE INDEX "attendance_logs_attendanceDate_idx" ON "attendance_logs"("attendanceDate");

CREATE INDEX "attendance_logs_siteId_idx" ON "attendance_logs"("siteId");

CREATE UNIQUE INDEX "attendance_logs_userId_attendanceDate_key" ON "attendance_logs"("userId", "attendanceDate");

CREATE INDEX "attendance_evidence_attendanceId_idx" ON "attendance_evidence"("attendanceId");

ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_loggedByUserId_fkey" FOREIGN KEY ("loggedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "attendance_evidence" ADD CONSTRAINT "attendance_evidence_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attendance_evidence" ADD CONSTRAINT "attendance_evidence_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attendance_evidence" ADD CONSTRAINT "attendance_evidence_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
