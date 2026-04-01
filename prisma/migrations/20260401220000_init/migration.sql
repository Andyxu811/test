-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('COACH', 'STUDENT');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TrainingStage" AS ENUM ('INTRO_ASSESSMENT', 'FOREHAND_FOUNDATION', 'FOREHAND_STABILITY', 'COMPREHENSIVE_UPGRADE');

-- CreateEnum
CREATE TYPE "TrainingRecordStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PhotoUsage" AS ENUM ('MOMENT', 'COMPARE');

-- CreateEnum
CREATE TYPE "CompareSide" AS ENUM ('BEFORE', 'AFTER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryCoachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "ageGroup" TEXT,
    "trainingGoal" TEXT,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "stage" "TrainingStage" NOT NULL,
    "stageStartedAt" TIMESTAMP(3) NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "sessionIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "trainedToday" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "nextFocus" TEXT NOT NULL,
    "homework" TEXT,
    "coachComment" TEXT NOT NULL,
    "status" "TrainingRecordStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPhoto" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "usage" "PhotoUsage" NOT NULL DEFAULT 'MOMENT',
    "focusLabel" TEXT,
    "compareGroupId" TEXT,
    "compareSide" "CompareSide",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_primaryCoachId_idx" ON "Student"("primaryCoachId");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "TrainingRecord_studentId_status_idx" ON "TrainingRecord"("studentId", "status");

-- CreateIndex
CREATE INDEX "TrainingRecord_studentId_sessionDate_idx" ON "TrainingRecord"("studentId", "sessionDate" DESC);

-- CreateIndex
CREATE INDEX "TrainingPhoto_recordId_sortOrder_idx" ON "TrainingPhoto"("recordId", "sortOrder");

-- CreateIndex
CREATE INDEX "TrainingPhoto_recordId_usage_idx" ON "TrainingPhoto"("recordId", "usage");

-- CreateIndex
CREATE INDEX "TrainingPhoto_compareGroupId_idx" ON "TrainingPhoto"("compareGroupId");

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_primaryCoachId_fkey" FOREIGN KEY ("primaryCoachId") REFERENCES "Coach"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPhoto" ADD CONSTRAINT "TrainingPhoto_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

