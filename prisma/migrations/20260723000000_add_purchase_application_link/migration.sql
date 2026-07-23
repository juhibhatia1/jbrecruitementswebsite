-- Link an AI CandidateApplication back to the Purchase that paid for it, so that
-- completing the interview can propagate status onto the Purchase record that the
-- admin/employee dashboard reads from.

ALTER TABLE "CandidateApplication" ADD COLUMN IF NOT EXISTS "purchaseId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "CandidateApplication_purchaseId_key"
  ON "CandidateApplication"("purchaseId");

DO $$
BEGIN
  ALTER TABLE "CandidateApplication"
    ADD CONSTRAINT "CandidateApplication_purchaseId_fkey"
    FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
