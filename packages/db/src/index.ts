// Exportamos el cliente y todos los tipos generados por Prisma
// para que las apps puedan importarlos desde "@esquel-activo/db"
export { prisma } from './client'
export type {
  Tenant,
  TenantPlan,
  TenantMembership,
  TenantMemberRole,
  User,
  Account,
  Session,
  Category,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  OrderStatus,
} from '@prisma/client'
