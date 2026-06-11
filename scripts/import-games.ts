import "dotenv/config"
import fs from "fs"
import path from "path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const GAMES: {
  file: string
  title: string
  titleEn: string
  developer: string
  publisher: string
  releaseYear: number
  description: string
  genreSlug: string
}[] = [
  {
    file: "D:/LeoHo/Project/GameBase/game_covers/FBNeo - Arcade Games/Named_Boxarts/'88 Games.png",
    title: "88 Games",
    titleEn: "Konami '88 / Hyper Sports Special",
    developer: "Konami",
    publisher: "Konami",
    releaseYear: 1988,
    description: "Konami 在 1988 年推出的体育竞技游戏，基于 1988 年首尔奥运会。是 Track & Field 系列的第三部作品。",
    genreSlug: "action",
  },
  {
    file: "D:/LeoHo/Project/GameBase/game_covers/FBNeo - Arcade Games/Named_Boxarts/1941 - Counter Attack (900227 World).png",
    title: "1941: Counter Attack",
    titleEn: "1941: Counter Attack",
    developer: "Capcom",
    publisher: "Capcom",
    releaseYear: 1990,
    description: "Capcom 在 1990 年推出的纵版飞行射击游戏，是 194X 系列的一员。",
    genreSlug: "shooter",
  },
]

async function uploadCover(filePath: string, slug: string): Promise<string | null> {
  if (!fs.existsSync(filePath)) return null
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const buffer = fs.readFileSync(filePath)
    const fileName = `${slug}/cover.png`

    const { error } = await supabase.storage
      .from("game-covers")
      .upload(fileName, buffer, { contentType: "image/png", upsert: true })

    if (error) { console.error(`  上传失败: ${error.message}`); return null }
    const { data: urlData } = supabase.storage.from("game-covers").getPublicUrl(fileName)
    return urlData.publicUrl
  } catch (e) { console.error(`  上传异常:`, e); return null }
}

async function main() {
  const arcade = await prisma.platform.findUnique({ where: { slug: "arcade" } })
  if (!arcade) { console.error("arcade platform not found"); return }
  const genres = await prisma.genre.findMany()
  const genreMap = Object.fromEntries(genres.map(g => [g.slug, g.id]))

  for (const game of GAMES) {
    console.log(`\n处理: ${game.title}`)
    const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    const existing = await prisma.game.findUnique({ where: { slug } })
    if (existing) { console.log(`  已存在，跳过`); continue }

    console.log(`  上传封面...`)
    const coverUrl = await uploadCover(game.file, slug)
    if (coverUrl) console.log(`  封面URL: ${coverUrl.substring(0, 50)}...`)

    const created = await prisma.game.create({
      data: {
        title: game.title,
        titleEn: game.titleEn,
        slug, developer: game.developer, publisher: game.publisher,
        releaseYear: game.releaseYear, description: game.description,
        coverImageUrl: coverUrl,
      },
    })
    await prisma.gamePlatform.create({ data: { gameId: created.id, platformId: arcade.id } })
    const genreId = genreMap[game.genreSlug]
    if (genreId) await prisma.gameGenre.create({ data: { gameId: created.id, genreId } })
    console.log(`  ✅ 已创建: ${game.title}`)
  }

  console.log("\n✅ 完成！")
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
