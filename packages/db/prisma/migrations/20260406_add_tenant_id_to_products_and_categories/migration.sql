-- AddColumn: tenantId to Category
ALTER TABLE "tenant_template"."Category" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '';

-- AddColumn: tenantId to Product
ALTER TABLE "tenant_template"."Product" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '';

-- Remove old unique constraint on Category.slug and add composite unique
ALTER TABLE "tenant_template"."Category" DROP CONSTRAINT IF EXISTS "Category_slug_key";
ALTER TABLE "tenant_template"."Category" ADD CONSTRAINT "Category_tenantId_slug_key" UNIQUE ("tenantId", "slug");

-- Remove old unique constraint on Product.slug and add composite unique
ALTER TABLE "tenant_template"."Product" DROP CONSTRAINT IF EXISTS "Product_slug_key";
ALTER TABLE "tenant_template"."Product" ADD CONSTRAINT "Product_tenantId_slug_key" UNIQUE ("tenantId", "slug");

-- CreateIndex for faster queries by tenantId
CREATE INDEX "Category_tenantId_idx" ON "tenant_template"."Category"("tenantId");
CREATE INDEX "Product_tenantId_idx" ON "tenant_template"."Product"("tenantId");
