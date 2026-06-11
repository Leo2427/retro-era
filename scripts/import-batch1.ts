import "dotenv/config"
import fs from "fs"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { createClient } from "@supabase/supabase-js"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COVERS_DIR = "D:/LeoHo/Project/GameBase/game_covers/FBNeo - Arcade Games/Named_Boxarts"

const GAMES = [
  { titleCn: "88科乐美运动会", titleEn: "'88 Games", dev: "Konami", pub: "Konami", year: "1988", genre: "action", desc: "以1988年汉城奥运会为背景的体育合集游戏。" },
  { titleCn: "1941：反击战", titleEn: "1941: Counter Attack", dev: "Capcom", pub: "Capcom", year: "1990", genre: "shooter", desc: "Capcom出品的纵向卷轴射击游戏。" },
  { titleCn: "1944 征服世界", titleEn: "1944: The Loop Master", dev: "Raizing", pub: "Capcom", year: "2000", genre: "shooter", desc: "194X系列第五作，纵版射击游戏。" },
  { titleCn: "19XX：命运否决战", titleEn: "19XX: The War Against Destiny", dev: "Capcom", pub: "Capcom", year: "1995", genre: "shooter", desc: "Capcom纵版卷轴射击游戏，194X第四作。" },
  { titleCn: "四次元战士", titleEn: "4-D Warriors", dev: "Coreland", pub: "Sega", year: "1985", genre: "shooter", desc: "操控喷气背包战士在平行宇宙间穿梭战斗。" },
  { titleCn: "宇宙骑警", titleEn: "A.B. Cop", dev: "Aicom", pub: "Sega", year: "1990", genre: "racing", desc: "驾驶空中摩托扮演未来警察追捕罪犯。" },
  { titleCn: "风云战机", titleEn: "Acrobat Mission", dev: "UPL", pub: "UPL", year: "1991", genre: "shooter", desc: "纵向卷轴射击游戏，抵御外星入侵。" },
  { titleCn: "超级攻击性武器", titleEn: "Act-Fancer Cybernetick Hyper Weapon", dev: "Data East", pub: "Data East", year: "1989", genre: "action", desc: "横版卷轴射击游戏，操控赛博格击败异形。" },
  { titleCn: "动作格斗", titleEn: "Action Fighter", dev: "Sega", pub: "Sega", year: "1986", genre: "action", desc: "俯视角载具战斗游戏，可变形为多种交通工具。" },
  { titleCn: "四国战机", titleEn: "Aero Fighters", dev: "Video System", pub: "Tecmo", year: "1992", genre: "shooter", desc: "纵版射击游戏，可选美日中俄四国战机。" },
  { titleCn: "冲破火网2", titleEn: "After Burner II", dev: "Sega AM2", pub: "Sega", year: "1987", genre: "shooter", desc: "世嘉经典街机飞行射击游戏。" },
  { titleCn: "超级特工邦德", titleEn: "Agent Super Bond", dev: "Alpha Co.", pub: "Signatron", year: "1985", genre: "shooter", desc: "俯视角射击游戏，特工解救人质。" },
  { titleCn: "空中突击", titleEn: "Air Assault", dev: "Irem", pub: "Irem", year: "1993", genre: "shooter", desc: "纵版卷轴射击游戏，对抗邪恶组织。" },
  { titleCn: "空袭", titleEn: "Air Attack", dev: "Comad", pub: "Comad", year: "1996", genre: "shooter", desc: "纵向卷轴射击游戏，4种武器火力升级。" },
  { titleCn: "空战双鹰", titleEn: "Air Duel", dev: "Irem", pub: "Irem", year: "1990", genre: "shooter", desc: "纵版卷轴射击游戏，支持双人合作。" },
  { titleCn: "飞狼", titleEn: "Airwolf", dev: "Kyugo", pub: "Kyugo", year: "1987", genre: "shooter", desc: "改编自同名电视剧的横版卷轴射击游戏。" },
  { titleCn: "飓风战机", titleEn: "A-JAX", dev: "Konami", pub: "Konami", year: "1987", genre: "shooter", desc: "科乐美纵版卷轴射击游戏。" },
  { titleCn: "组合战机", titleEn: "Alcon (Slap Fight)", dev: "Toaplan", pub: "Taito", year: "1986", genre: "shooter", desc: "纵版卷轴射击游戏，收集星星升级武器。" },
  { titleCn: "巴拉迪克", titleEn: "Alien Sector", dev: "Namco", pub: "Namco", year: "1985", genre: "shooter", desc: "纵向卷轴射击游戏，穿越8个世界。" },
  { titleCn: "异形风暴", titleEn: "Alien Syndrome", dev: "Sega", pub: "Sega", year: "1987", genre: "shooter", desc: "在太空站消灭异形营救同伴的射击游戏。" },
  { titleCn: "异形对铁血战士", titleEn: "Alien vs. Predator", dev: "Capcom", pub: "Capcom", year: "1994", genre: "action", desc: "Capcom横版清关游戏，异形大战铁血战士。" },
  { titleCn: "异形", titleEn: "Aliens", dev: "Konami", pub: "Konami", year: "1990", genre: "shooter", desc: "改编电影异形2的横版跑动射击游戏。" },
  { titleCn: "鳄鱼猎人", titleEn: "Alligator Hunt", dev: "Gaelco", pub: "Gaelco", year: "1994", genre: "shooter", desc: "外星爬虫入侵，使用激光枪迎战。" },
  { titleCn: "高山滑雪", titleEn: "Alpine Ski", dev: "Taito", pub: "Taito", year: "1982", genre: "action", desc: "滑雪街机游戏，包含速降回转和跳台滑雪。" },
  { titleCn: "兽王记", titleEn: "Altered Beast", dev: "Sega", pub: "Sega", year: "1988", genre: "action", desc: "经典横版动作游戏，变身为野兽形态战斗。" },
  { titleCn: "美国高速公路", titleEn: "American Speedway", dev: "Enerdyne", pub: "PGD", year: "1987", genre: "racing", desc: "俯视角赛车游戏，支持双人同屏对战。" },
  { titleCn: "画线", titleEn: "Amidar", dev: "Konami", pub: "Stern", year: "1981", genre: "action", desc: "网格涂色益智游戏，躲避敌人涂色所有区域。" },
  { titleCn: "天使宝贝", titleEn: "Angel Kids", dev: "EXA Planning", pub: "Sega", year: "1988", genre: "action", desc: "爬塔式动作游戏，击破气球获取道具。" },
  { titleCn: "食蚁兽", titleEn: "Anteater", dev: "Stern", pub: "Tago", year: "1982", genre: "action", desc: "迷宫解谜游戏，伸长舌头吃蚂蚁。" },
  { titleCn: "装甲车", titleEn: "Armored Car", dev: "Stern", pub: "Stern", year: "1981", genre: "action", desc: "在迷宫中收集钱袋并送达目的地。" },
]

async function findCover(titleEn: string): Promise<string | null> {
  const files = fs.readdirSync(COVERS_DIR)
  const words = titleEn.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const scored = files.map(f => ({
    file: COVERS_DIR + "/" + f,
    score: words.filter(w => f.toLowerCase().includes(w)).length
  })).sort((a, b) => b.score - a.score)
  return scored.length > 0 && scored[0].score > 0 ? scored[0].file : null
}

async function uploadCover(fp: string, slug: string): Promise<string | null> {
  if (!fs.existsSync(fp)) return null
  const buf = fs.readFileSync(fp)
  const { error } = await supabase.storage.from("game-covers").upload(slug + "/cover.png", buf, { contentType: "image/png", upsert: true })
  if (error) { console.error("  上传失败:", error.message); return null }
  const { data } = supabase.storage.from("game-covers").getPublicUrl(slug + "/cover.png")
  return data.publicUrl
}

async function main() {
  const arcade = await prisma.platform.findUnique({ where: { slug: "arcade" } })
  if (!arcade) { console.error("arcade not found"); return }
  const genres = await prisma.genre.findMany()
  const genreMap: Record<string, string> = {}
  genres.forEach(g => genreMap[g.slug] = g.id)

  let ok = 0, skip = 0, fail = 0

  for (const g of GAMES) {
    const slug = g.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").replace(/\(|\)/g, "")
    const yr = parseInt(g.year) || 0

    if (await prisma.game.findUnique({ where: { slug } })) { console.log("跳过:", g.titleCn); skip++; continue }

    console.log(`\n${g.titleCn} (${g.titleEn})`)
    const cf = await findCover(g.titleEn)
    const url = cf ? await uploadCover(cf, slug) : null
    console.log("  封面:", url ? "✅" : (cf ? "❌上传失败" : "未找到"))

    try {
      const game = await prisma.game.create({
        data: { title: g.titleCn, titleEn: g.titleEn, slug, developer: g.dev, publisher: g.pub, releaseYear: yr, description: g.desc, coverImageUrl: url }
      })
      await prisma.gamePlatform.create({ data: { gameId: game.id, platformId: arcade.id } })
      const gid = genreMap[g.genre]
      if (gid) await prisma.gameGenre.create({ data: { gameId: game.id, genreId: gid } })
      console.log("  ✅"); ok++
    } catch (e: any) { console.error("  ❌", e.message); fail++ }
  }

  console.log(`\n完成: ${ok} 成功, ${skip} 跳过, ${fail} 失败`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
