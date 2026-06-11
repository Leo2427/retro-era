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

console.log(`待补: ${games.length}, 搜索结果: ${salvaged.length}`)

const DIRS = ["D:/LeoHo/Project/GameBase/game_covers/FBNeo - Arcade Games/Named_Boxarts","D:/LeoHo/Project/GameBase/game_covers/MAME/Named_Boxarts"]

var coverMap = new Map()
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".png")) continue
    const name = f.replace(/\.png$/i,"").replace(/\s*\([^)]*\)\s*/g," ").trim()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")
    coverMap.set(slug.substring(0,15), name)
  }
}

var ok = 0
for (const g of games) {
  const slug15 = g.slug.substring(0, 15)
  const coverName = (coverMap.get(slug15) || "").toLowerCase()
  const coverWords = coverName.split(/[\s,]+/).filter(w => w.length > 2)

  for (const r of salvaged) {
    const dev = r.dev.toLowerCase()
    const desc = r.desc.toLowerCase()
    let score = 0
    for (const kw of coverWords) {
      if (desc.includes(kw) || dev.includes(kw)) score += 2
    }
    if (score >= 2) {
      await p.game.update({ where: { id: g.id }, data: { title: r.cn, developer: r.dev, releaseYear: r.year, description: r.desc } })
      ok++; break
    }
  }
}

console.log(`匹配成功: ${ok} 款`)
await p.$disconnect()
}
main().catch(console.error)
