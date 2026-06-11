import "dotenv/config"
import fs from "fs"
import path from "path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { createClient } from "@supabase/supabase-js"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const DIRS = [
  "D:/LeoHo/Project/GameBase/game_covers/FBNeo - Arcade Games/Named_Boxarts",
  "D:/LeoHo/Project/GameBase/game_covers/MAME/Named_Boxarts",
]

function cleanName(filename: string): string {
  return filename.replace(/\.png$/i, "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s*\[[^\]]*\]\s*/g, " ")
    .replace(/,?\s*(FD\d+|315-\d+|set\s*\d+|World|US|Japan|Euro|Asia|rev\s*\d+|bootleg|protected|unprotected)/gi, "")
    .replace(/\s+/g, " ").trim()
}

function genSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").replace(/\(|\)|'|!/g, "")
}

const genreKeywords: Record<string, string> = {
  fight: "fighting", fighter: "fighting", combat: "fighting", martial: "fighting",
  shoot: "shooter", gun: "shooter", fire: "shooter", missile: "shooter", cannon: "shooter",
  race: "racing", drive: "racing", grandprix: "racing", speed: "racing",
  sport: "action", soccer: "action", baseball: "action", basket: "action",
}

function guessGenre(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, val] of Object.entries(genreKeywords)) {
    if (lower.includes(key)) return val
  }
  return "action"
}

async function uploadCover(filePath: string, slug: string): Promise<string | null> {
  if (!fs.existsSync(filePath)) return null
  try {
    const buf = fs.readFileSync(filePath)
    const { error } = await supabase.storage.from("game-covers").upload(slug + "/cover.png", buf, { contentType: "image/png", upsert: true })
    if (error) { console.error("  上传失败:", error.message); return null }
    const { data } = supabase.storage.from("game-covers").getPublicUrl(slug + "/cover.png")
    return data.publicUrl
  } catch { return null }
}

async function main() {
  const arcade = await prisma.platform.findUnique({ where: { slug: "arcade" } })
  if (!arcade) { console.error("arcade not found"); return }

  const genres = await prisma.genre.findMany()
  const genreMap: Record<string, string> = {}
  genres.forEach(g => genreMap[g.slug] = g.id)

  const allFiles: { file: string; name: string; slug: string }[] = []
  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".png")) continue
      const name = cleanName(f)
      const slug = genSlug(name)
      if (!slug) continue
      const exists = await prisma.game.findUnique({ where: { slug }, select: { id: true } })
      if (!exists) allFiles.push({ file: path.join(dir, f), name, slug })
    }
  }

  console.log(`待导入: ${allFiles.length} 个游戏`)
  let ok = 0, fail = 0

  for (let i = 0; i < allFiles.length; i++) {
    const { file, name, slug } = allFiles[i]
    console.log(`[${i+1}/${allFiles.length}] ${name}`)

    const coverUrl = await uploadCover(file, slug)
    if (!coverUrl) { console.log("  封面上传失败"); fail++; continue }

    try {
      const game = await prisma.game.create({
        data: { title: name, slug, developer: "Unknown", publisher: "Unknown", coverImageUrl: coverUrl }
      })
      await prisma.gamePlatform.create({ data: { gameId: game.id, platformId: arcade.id } })
      const genre = guessGenre(name)
      if (genreMap[genre]) await prisma.gameGenre.create({ data: { gameId: game.id, genreId: genreMap[genre] } })
      console.log("  ✅")
      ok++
    } catch (e: any) { console.error("  ❌", e.message); fail++ }

    if (i > 0 && i % 10 === 0) await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n✅ 完成: ${ok} 成功, ${fail} 失败`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
