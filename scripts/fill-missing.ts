import "dotenv/config"
import fs from "fs"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
const p = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})

const DIRS = ["D:/LeoHo/Project/GameBase/game_covers/FBNeo - Arcade Games/Named_Boxarts","D:/LeoHo/Project/GameBase/game_covers/MAME/Named_Boxarts"]

var slugToFile = new Map()
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".png")) continue
    const name = f.replace(/\.png$/i,"").replace(/\s*\([^)]*\)\s*/g," ").replace(/\s*\[[^\]]*\]\s*/g," ")
      .replace(/,?\s*(FD\d+|315-\d+|set\s*\d+|World|US|Japan|Euro|Asia|rev\s*\d+|bootleg|protected|unprotected)/gi,"")
      .replace(/\s+/g," ").trim()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").replace(/\(|\)|'|!/g,"")
    slugToFile.set(slug, f)
  }
}

var games = await p.game.findMany({
  where: { titleEn: null, platforms: { some: { platform: { slug: "arcade" } } } },
  select: { id: true, slug: true, title: true },
})

console.log(`缺中文名: ${games.length}, 封面slug: ${slugToFile.size}`)

var matched = 0
for (const game of games) {
  for (const [coverSlug] of slugToFile) {
    const minLen = Math.min(10, coverSlug.length, game.slug.length)
    if (game.slug.substring(0,minLen) === coverSlug.substring(0,minLen)) { matched++; break }
  }
}
console.log(`可匹配: ${matched}/${games.length}`)
await p.$disconnect()
}
main().catch(console.error)
