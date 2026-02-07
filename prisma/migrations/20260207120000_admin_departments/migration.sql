-- CreateTable: AdminNote
CREATE TABLE "admin_notes" (
    "id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SafetyPolicy
CREATE TABLE "safety_policies" (
    "id" TEXT NOT NULL,
    "maxWarningsBeforeBan" INTEGER NOT NULL DEFAULT 3,
    "autoHideFlagsCount" INTEGER NOT NULL DEFAULT 5,
    "autoHideConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "maxReportsPerUser" INTEGER NOT NULL DEFAULT 10,
    "enableAutoModeration" BOOLEAN NOT NULL DEFAULT false,
    "enableAIModeration" BOOLEAN NOT NULL DEFAULT false,
    "enableUserReporting" BOOLEAN NOT NULL DEFAULT true,
    "requireEmailVerify" BOOLEAN NOT NULL DEFAULT true,
    "newUserCooldownHours" INTEGER NOT NULL DEFAULT 0,
    "maxContentPerDay" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BannedKeyword
CREATE TABLE "banned_keywords" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banned_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_notes_userId_idx" ON "admin_notes"("userId");
CREATE INDEX "admin_notes_actorId_idx" ON "admin_notes"("actorId");
CREATE UNIQUE INDEX "banned_keywords_keyword_key" ON "banned_keywords"("keyword");
CREATE INDEX "banned_keywords_keyword_idx" ON "banned_keywords"("keyword");
CREATE INDEX "banned_keywords_isActive_idx" ON "banned_keywords"("isActive");

-- AddForeignKey
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
