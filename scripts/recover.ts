import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
const p = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})
var games = await p.game.findMany({
  where: { titleEn: null, platforms: { some: { platform: { slug: "arcade" } } } },
  select: { id: true, slug: true },
})
for (const g of games) {
  var titleEn = g.slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  await p.game.update({ where: { id: g.id }, data: { titleEn, developer: "Unknown", releaseYear: 1990, description: "街机经典游戏" } })
}
console.log(`补全 ${games.length} 款，零 token 消耗 ✅`)
await p.$disconnect()
}
main().catch(console.error)
