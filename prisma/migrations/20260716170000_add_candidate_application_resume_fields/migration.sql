-- Add missing resume fields to CandidateApplication
ALTER TABLE "CandidateApplication"
ADD COLUMN IF NOT EXISTS "resumeUrl" TEXT,
ADD COLUMN IF NOT EXISTS "resumeText" TEXT;
