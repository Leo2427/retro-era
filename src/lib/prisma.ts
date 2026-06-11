import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return new PrismaClient({} as never)
  }

  if (process.env.NODE_ENV === "production" && !connectionString.includes("sslmode=")) {
    connectionString += connectionString.includes("?") ? "&" : "?"
    connectionString += "sslmode=require"
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
