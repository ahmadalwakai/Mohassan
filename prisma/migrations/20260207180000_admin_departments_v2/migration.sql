-- AlterTable: Add new columns to contents table for moderation metadata
ALTER TABLE "contents" ADD COLUMN IF NOT EXISTS "hiddenReason" TEXT;
ALTER TABLE "contents" ADD COLUMN IF NOT EXISTS "matchedKeywords" JSONB;
ALTER TABLE "contents" ADD COLUMN IF NOT EXISTS "moderationTrigger" TEXT;
ALTER TABLE "contents" ADD COLUMN IF NOT EXISTS "moderationMeta" JSONB;

-- AlterTable: Add autoHideRules to safety_policies
ALTER TABLE "safety_policies" ADD COLUMN IF NOT EXISTS "autoHideRules" JSONB;

-- CreateTable: safety_policy_versions
CREATE TABLE IF NOT EXISTS "safety_policy_versions" (
    "id" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "actorId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_policy_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "safety_policy_versions_actorId_idx" ON "safety_policy_versions"("actorId");
CREATE INDEX IF NOT EXISTS "safety_policy_versions_createdAt_idx" ON "safety_policy_versions"("createdAt");
