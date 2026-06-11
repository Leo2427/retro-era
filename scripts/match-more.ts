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

console.log(`剩余: ${games.length}`)
var ok = 0
for (const g of games) {
  for (const r of salvaged) {
    const dev = r.dev.toLowerCase()
    const cn = r.cn
    const devWords = dev.split(/[\s\/,]+/).filter(w => w.length > 2)
    let matched = false
    for (const dw of devWords) {
      if (g.slug.includes(dw) || g.title.toLowerCase().includes(dw)) { matched = true; break }
    }
    if (!matched && cn.length >= 2) {
      const sub = cn.substring(0,2)
      if (g.slug.includes(sub) || g.title.includes(sub)) matched = true
    }
    if (matched) {
      await p.game.update({ where: { id: g.id }, data: { title: cn, developer: r.dev, releaseYear: r.year, description: r.desc } })
      ok++; break
    }
  }
}
console.log(`本轮匹配: ${ok}`)
await p.$disconnect()
}
main().catch(console.error)
