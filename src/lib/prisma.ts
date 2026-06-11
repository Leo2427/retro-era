import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return new PrismaClient({} as never)
  }

  const pool = new (require("pg").Pool)({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
