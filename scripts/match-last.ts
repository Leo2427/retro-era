import "dotenv/config"
import fs from "fs"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
const p = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})
const salvaged = JSON.parse(fs.readFileSync("scripts/salvaged2.json", "utf-8"))

var games = await p.game.findMany({
  where: { description: "街机经典游戏", platforms: { some: { platform: { slug: "arcade" } } } },
  select: { id: true, slug: true, title: true },
})

var ok = 0
for (const r of salvaged) {
  const dev = r.dev.toLowerCase()
  const devWord = dev.split(/[\s\/,]+/).filter(w => w.length > 3)[0]
  if (!devWord) continue
  for (const g of games) {
    if (g.slug.includes(devWord)) {
      await p.game.update({ where: { id: g.id }, data: { title: r.cn, developer: r.dev, releaseYear: r.year, description: r.desc } })
      ok++
      games = games.filter(x => x.id !== g.id)
      break
    }
  }
}
console.log(`末轮匹配: ${ok}, 最终未匹配: ${games.length}`)
await p.$disconnect()
}
main().catch(console.error)
