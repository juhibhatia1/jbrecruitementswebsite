-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum (safe)
DO $$ BEGIN
  CREATE TYPE "InterviewTemplateOwnerRole" AS ENUM ('ADMIN', 'EMPLOYEE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CandidateInterviewPreference" AS ENUM ('AI', 'MANUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CandidateApplicationStatus" AS ENUM ('APPLIED', 'MANUAL_REVIEW_PENDING', 'AI_INVITED', 'INTERVIEW_STARTED', 'INTERVIEW_COMPLETED', 'TOKEN_EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InterviewSessionStatus" AS ENUM ('CONNECTING', 'ACTIVE', 'COMPLETED', 'TERMINATED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterTable Purchase (safe)
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "candidatePhone" TEXT;
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "completionNotes" TEXT;
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "deliveryDeadline" TIMESTAMP(3);
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE IF NOT EXISTS "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "fileName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChatConversation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InterviewTemplate" (
    "id" TEXT NOT NULL,
    "ownerRole" "InterviewTemplateOwnerRole" NOT NULL,
    "jobRole" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "techStack" TEXT[],
    "requiredSkills" TEXT[],
    "durationMinutes" INTEGER NOT NULL,
    "difficultyLevel" TEXT NOT NULL,
    "advancedConfig" JSONB,
    "interviewDescription" TEXT,
    "systemInstructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CandidateApplication" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "candidatePhone" TEXT,
    "linkedInUrl" TEXT,
    "interviewPreference" "CandidateInterviewPreference" NOT NULL,
    "accessTokenHash" TEXT NOT NULL,
    "accessTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "status" "CandidateApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InterviewSession" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modelUsed" TEXT,
    "status" "InterviewSessionStatus" NOT NULL DEFAULT 'CONNECTING',
    "transcript" JSONB NOT NULL,
    "evaluationEvents" JSONB NOT NULL,
    "finalReport" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "KnowledgeDocument_isActive_idx" ON "KnowledgeDocument"("isActive");
CREATE INDEX IF NOT EXISTS "KnowledgeDocument_createdAt_idx" ON "KnowledgeDocument"("createdAt");
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_documentId_idx" ON "KnowledgeChunk"("documentId");
CREATE UNIQUE INDEX IF NOT EXISTS "ChatConversation_sessionId_key" ON "ChatConversation"("sessionId");
CREATE INDEX IF NOT EXISTS "ChatConversation_sessionId_idx" ON "ChatConversation"("sessionId");
CREATE INDEX IF NOT EXISTS "ChatConversation_createdAt_idx" ON "ChatConversation"("createdAt");
CREATE INDEX IF NOT EXISTS "InterviewTemplate_ownerRole_createdAt_idx" ON "InterviewTemplate"("ownerRole", "createdAt");
CREATE INDEX IF NOT EXISTS "InterviewTemplate_isActive_createdAt_idx" ON "InterviewTemplate"("isActive", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "CandidateApplication_accessTokenHash_key" ON "CandidateApplication"("accessTokenHash");
CREATE INDEX IF NOT EXISTS "CandidateApplication_templateId_createdAt_idx" ON "CandidateApplication"("templateId", "createdAt");
CREATE INDEX IF NOT EXISTS "CandidateApplication_candidateEmail_idx" ON "CandidateApplication"("candidateEmail");
CREATE INDEX IF NOT EXISTS "CandidateApplication_status_accessTokenExpiresAt_idx" ON "CandidateApplication"("status", "accessTokenExpiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "InterviewSession_applicationId_key" ON "InterviewSession"("applicationId");
CREATE INDEX IF NOT EXISTS "InterviewSession_status_createdAt_idx" ON "InterviewSession"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "InterviewSession_completedAt_idx" ON "InterviewSession"("completedAt");

-- AddForeignKey (safe)
DO $$ BEGIN
  ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CandidateApplication" ADD CONSTRAINT "CandidateApplication_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InterviewTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CandidateApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
