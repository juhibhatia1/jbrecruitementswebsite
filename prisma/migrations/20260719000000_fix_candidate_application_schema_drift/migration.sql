-- Fix drift for CandidateApplication so Prisma schema and DB stay aligned.
-- Safe to run on already-aligned databases.

DO $$ BEGIN
  ALTER TYPE "CandidateApplicationStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "CandidateApplication"
  ADD COLUMN IF NOT EXISTS "resumeUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "resumeText" TEXT,
  ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);

