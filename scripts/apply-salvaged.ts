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

console.log(`待匹配: ${games.length}, 搜索结果: ${salvaged.length}`)
var ok = 0
for (const g of games) {
  for (const r of salvaged) {
    const cn = r.cn
    // 匹配: 中文名前2个字出现在slug中
    var matched = false
    for (let len = 2; len <= 6; len++) {
      const sub = cn.substring(0, len)
      if (!sub) continue
      if (g.slug.toLowerCase().includes(sub) || g.title.toLowerCase().includes(sub)) {
        matched = true; break
      }
    }
    if (matched) {
      await p.game.update({ where: { id: g.id }, data: { title: cn, developer: r.dev, releaseYear: r.year, description: r.desc } })
      ok++; break
    }
  }
}
console.log(`成功匹配: ${ok} 款`)
console.log(`未匹配: ${games.length - ok} 款`)
await p.$disconnect()
}
main().catch(console.error)
