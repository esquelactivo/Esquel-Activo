-- CreateEnum: QrTokenType
CREATE TYPE "public"."QrTokenType" AS ENUM ('STAMP', 'POINTS', 'EVENT');

-- CreateTable: QrToken (public schema)
CREATE TABLE "public"."QrToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "public"."QrTokenType" NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QrToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "QrToken_code_key" ON "public"."QrToken"("code");
CREATE INDEX "QrToken_code_idx" ON "public"."QrToken"("code");
CREATE INDEX "QrToken_userId_idx" ON "public"."QrToken"("userId");

-- CreateTable: StampCard (tenant_template schema)
CREATE TABLE "tenant_template"."StampCard" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalStamps" INTEGER NOT NULL DEFAULT 10,
    "reward" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StampCard_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StampCard_tenantId_idx" ON "tenant_template"."StampCard"("tenantId");

-- CreateTable: UserStampCard (tenant_template schema)
CREATE TABLE "tenant_template"."UserStampCard" (
    "id" TEXT NOT NULL,
    "stampCardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStamps" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserStampCard_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserStampCard_stampCardId_userId_key" ON "tenant_template"."UserStampCard"("stampCardId", "userId");
CREATE INDEX "UserStampCard_userId_idx" ON "tenant_template"."UserStampCard"("userId");
ALTER TABLE "tenant_template"."UserStampCard"
    ADD CONSTRAINT "UserStampCard_stampCardId_fkey"
    FOREIGN KEY ("stampCardId") REFERENCES "tenant_template"."StampCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: StampTransaction (tenant_template schema)
CREATE TABLE "tenant_template"."StampTransaction" (
    "id" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,
    "stampsAdded" INTEGER NOT NULL DEFAULT 1,
    "merchantNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StampTransaction_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "tenant_template"."StampTransaction"
    ADD CONSTRAINT "StampTransaction_userCardId_fkey"
    FOREIGN KEY ("userCardId") REFERENCES "tenant_template"."UserStampCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
