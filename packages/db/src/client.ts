import { PrismaClient } from '@prisma/client'

// Patrón Singleton para el PrismaClient.
// En desarrollo, Next.js recarga módulos con Hot Reload y crearía múltiples
// conexiones a la DB. Este patrón garantiza que solo exista UNA instancia.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
