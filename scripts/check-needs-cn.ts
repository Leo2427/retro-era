import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
const games = await prisma.game.findMany({
  where: { titleEn: null, platforms: { some: { platform: { slug: "arcade" } } } },
  select: { slug: true, title: true }, take: 500,
})
console.log(JSON.stringify(games.map(g => ({ slug: g.slug, title: g.title })), null, 2))
await prisma.$disconnect()
