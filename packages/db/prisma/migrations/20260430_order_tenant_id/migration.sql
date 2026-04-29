-- AlterTable: agregar tenantId a Order
ALTER TABLE "tenant_template"."Order" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '';

-- Crear índice para queries por tenant
CREATE INDEX "Order_tenantId_idx" ON "tenant_template"."Order"("tenantId");

-- AlterTable: hacer variantId opcional en OrderItem
ALTER TABLE "tenant_template"."OrderItem" ALTER COLUMN "variantId" DROP NOT NULL;
