-- CreateEnum
CREATE TYPE "public"."FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'IMAGE', 'URL', 'DATE', 'BOOLEAN', 'NUMBER');

-- CreateTable: PostType (schema public)
CREATE TABLE "public"."PostType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PostType_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PostTypeField (schema public)
CREATE TABLE "public"."PostTypeField" (
    "id" TEXT NOT NULL,
    "postTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "public"."FieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PostTypeField_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Post (schema tenant_template)
CREATE TABLE "tenant_template"."Post" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "postTypeId" TEXT NOT NULL,
    "postTypeSlug" TEXT NOT NULL,
    "postTypeName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PostFieldValue (schema tenant_template)
CREATE TABLE "tenant_template"."PostFieldValue" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "value" TEXT,
    CONSTRAINT "PostFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostType_slug_key" ON "public"."PostType"("slug");
CREATE UNIQUE INDEX "PostTypeField_postTypeId_key_key" ON "public"."PostTypeField"("postTypeId", "key");
CREATE INDEX "Post_tenantId_idx" ON "tenant_template"."Post"("tenantId");
CREATE INDEX "Post_tenantId_postTypeSlug_idx" ON "tenant_template"."Post"("tenantId", "postTypeSlug");
CREATE UNIQUE INDEX "PostFieldValue_postId_fieldKey_key" ON "tenant_template"."PostFieldValue"("postId", "fieldKey");

-- AddForeignKey
ALTER TABLE "public"."PostTypeField" ADD CONSTRAINT "PostTypeField_postTypeId_fkey"
    FOREIGN KEY ("postTypeId") REFERENCES "public"."PostType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tenant_template"."PostFieldValue" ADD CONSTRAINT "PostFieldValue_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "tenant_template"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
