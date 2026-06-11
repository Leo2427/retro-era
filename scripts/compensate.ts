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

const DIRS = ["D:/LeoHo/Project/GameBase/game_covers/FBNeo - Arcade Games/Named_Boxarts","D:/LeoHo/Project/GameBase/game_covers/MAME/Named_Boxarts"]
var coverNames = new Map()
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".png")) continue
    const raw = f.replace(/\.png$/i,"")
    const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")
    coverNames.set(slug.substring(0,15), raw)
  }
}

var ok = 0
for (const g of games) {
  const enName = coverNames.get(g.slug.substring(0,15)) || ""
  if (!enName) continue
  const enLower = enName.toLowerCase()
  const enWords = enLower.replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w => w.length > 2)
  const enBigrams = []
  for (let i = 0; i < enLower.length - 3; i++) enBigrams.push(enLower.substring(i, i + 4))

  for (const r of salvaged) {
    const descLower = r.desc.toLowerCase()
    let matched = false
    for (const bigram of enBigrams) {
      if (descLower.includes(bigram)) { matched = true; break }
    }
    if (!matched) {
      for (const w of enWords) {
        if (descLower.includes(w)) { matched = true; break }
      }
    }
    if (matched) {
      await p.game.update({ where: { id: g.id }, data: { title: r.cn, developer: r.dev, releaseYear: r.year, description: r.desc } })
      ok++; break
    }
  }
}

console.log(`补完: ${ok}`)
var left = await p.game.count({where:{description:"街机经典游戏",platforms:{some:{platform:{slug:"arcade"}}}}})
console.log(`最终剩余: ${left}`)
await p.$disconnect()
}
main().catch(console.error)
