import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL
const adapter = connectionString
  ? new PrismaPg({ connectionString })
  : undefined

if (!connectionString || !adapter) {
  throw new Error("DATABASE_URL environment variable is required")
}
const prisma = new PrismaClient({ adapter })

// ── 平台数据 ──
const platforms = [
  { name: "Arcade", slug: "arcade" },
  { name: "NES", slug: "nes" },
  { name: "SNES", slug: "snes" },
  { name: "Mega Drive", slug: "mega-drive" },
  { name: "PlayStation", slug: "playstation" },
  { name: "Neo Geo", slug: "neo-geo" },
  { name: "Dreamcast", slug: "dreamcast" },
  { name: "Nintendo 64", slug: "nintendo-64" },
  { name: "Game Boy Advance", slug: "game-boy-advance" },
  { name: "PC Engine", slug: "pc-engine" },
]

// ── 类型数据 ──
const genres = [
  { name: "格斗", slug: "fighting" },
  { name: "动作", slug: "action" },
  { name: "平台跳跃", slug: "platformer" },
  { name: "角色扮演", slug: "rpg" },
  { name: "冒险", slug: "adventure" },
  { name: "射击", slug: "shooter" },
  { name: "清版过关", slug: "beat-em-up" },
  { name: "竞速", slug: "racing" },
]

// ── 游戏数据 ──
interface MoveData {
  character?: string
  category: string
  command: string
  name?: string
  description?: string
  damage?: string
  order: number
}

interface GameSeed {
  title: string
  slug: string
  developer: string
  publisher: string
  releaseYear: number
  description: string
  gameplayText: string
  storyText?: string
  platformSlugs: string[]
  genreSlugs: string[]
  moves: MoveData[]
}

const games: GameSeed[] = [
  {
    title: "Street Fighter II Turbo",
    slug: "street-fighter-2-turbo",
    developer: "Capcom",
    publisher: "Capcom",
    releaseYear: 1992,
    description:
      "《街头霸王 II Turbo》是 Capcom 在 1992 年推出的格斗游戏，是《街头霸王 II》的加强版。游戏引入了超必杀技系统，速度更快，招式更丰富，被誉为 2D 格斗游戏的巅峰之作。",
    gameplayText:
      "玩家从 8 位世界格斗家中选择一位，与电脑对手对战。游戏采用 6 键布局（轻中重拳脚），每名角色拥有独特的必杀技和超必杀技。比赛采用三局两胜制。",
    storyText:
      "世界最强格斗家大赛再次召开，来自世界各地的格斗家们为了争夺「世界最强」的称号而展开激战。",
    platformSlugs: ["arcade", "snes"],
    genreSlugs: ["fighting"],
    moves: [
      { character: "Ryu", category: "必杀技", command: "↓↘→ + P", name: "波动拳", order: 1 },
      { character: "Ryu", category: "必杀技", command: "→↓↘ + P", name: "昇龙拳", order: 2 },
      { character: "Ryu", category: "必杀技", command: "←↙↓↘→ + K", name: "龙卷旋风腿", order: 3 },
      { character: "Ryu", category: "超必杀技", command: "↓↘→↓↘→ + P", name: "真空波动拳", order: 4 },
      { character: "Ken", category: "必杀技", command: "↓↘→ + P", name: "波动拳", order: 1 },
      { character: "Ken", category: "必杀技", command: "→↓↘ + P", name: "昇龙拳", order: 2 },
      { character: "Ken", category: "必杀技", command: "←↙↓↘→ + K", name: "龙卷旋风腿", order: 3 },
      { character: "Ken", category: "超必杀技", command: "↓↘→↓↘→ + K", name: "神龙拳", order: 4 },
      { character: "Chun-Li", category: "必杀技", command: "←↙↓↘→ + K", name: "百裂脚", order: 1 },
      { character: "Chun-Li", category: "必杀技", command: "↓集气↑ + K", name: "天昇脚", order: 2 },
      { character: "Chun-Li", category: "超必杀技", command: "↓↘→↓↘→ + K", name: "凤翼扇", order: 3 },
    ],
  },
  {
    title: "The King of Fighters '98",
    slug: "kof-98",
    developer: "SNK",
    publisher: "SNK",
    releaseYear: 1998,
    description:
      "《拳皇 '98》是 SNK 在 1998 年推出的格斗游戏，拳皇系列集大成之作。本作没有剧情，专注于平衡性和游戏性，以 3v3 组队战和丰富的角色阵容闻名。",
    gameplayText:
      "玩家选择 3 名角色组成队伍，以接力方式进行对战。游戏引入 ADVANCE 和 EXTRA 两种战斗模式，影响能量槽的积攒方式。必杀技、超必杀技和 MAX 超必杀技的组合让战斗极具策略性。",
    platformSlugs: ["arcade", "neo-geo"],
    genreSlugs: ["fighting"],
    moves: [
      { character: "草薙京", category: "必杀技", command: "↓↘→ + P", name: "百式·鬼烧", order: 1 },
      { character: "草薙京", category: "必杀技", command: "→↓↘ + P", name: "百拾四式·荒咬", order: 2 },
      { character: "草薙京", category: "必杀技", command: "↓↙← + K", name: "七拾五式·改", order: 3 },
      { character: "草薙京", category: "超必杀技", command: "↓↘→↓↘→ + P", name: "大蛇薙", order: 4 },
      { character: "八神庵", category: "必杀技", command: "↓↘→ + P", name: "百式·鬼烧", order: 1 },
      { character: "八神庵", category: "必杀技", command: "→↓↘ + P", name: "百八式·闇払", order: 2 },
      { character: "八神庵", category: "必杀技", command: "←↙↓↘→ + K", name: "二百十二式·琴月阴", order: 3 },
      { character: "八神庵", category: "超必杀技", command: "↓↘→↓↘→ + P", name: "禁千二百十一式·八稚女", order: 4 },
      { character: "不知火舞", category: "必杀技", command: "↓↘→ + P", name: "花蝶扇", order: 1 },
      { character: "不知火舞", category: "必杀技", command: "→↓↘ + K", name: "龙炎舞", order: 2 },
      { character: "不知火舞", category: "超必杀技", command: "↓↙←↙↓↘→ + P", name: "超必杀忍蜂", order: 3 },
    ],
  },
  {
    title: "Street Fighter III 3rd Strike",
    slug: "sf3-3rd-strike",
    developer: "Capcom",
    publisher: "Capcom",
    releaseYear: 1999,
    description:
      "《街头霸王 III 3rd Strike》是 Capcom 街头霸王 III 系列的最终版本。以其精美的 2D 动画、独创的 BLOCKING 系统和深度的战斗机制，被许多玩家誉为 2D 格斗游戏的最高杰作。",
    gameplayText:
      "保留 6 键布局，引入\"BLOCKING\"系统——在攻击命中瞬间推前即可格挡并反击。SUPER ART 选择系统让玩家在多种超必杀技中选择其一。",
    platformSlugs: ["arcade", "dreamcast"],
    genreSlugs: ["fighting"],
    moves: [
      { character: "Ryu", category: "必杀技", command: "↓↘→ + P", name: "波动拳", order: 1 },
      { character: "Ryu", category: "必杀技", command: "→↓↘ + P", name: "昇龙拳", order: 2 },
      { character: "Ryu", category: "必杀技", command: "←↙↓↘→ + K", name: "龙卷旋风腿", order: 3 },
      { character: "Ryu", category: "Super Art", command: "↓↘→↓↘→ + P", name: "真空波动拳", order: 4 },
      { character: "Ryu", category: "Super Art", command: "↓↘→↓↘→ + K", name: "真·升龙拳", order: 5 },
      { character: "Ken", category: "必杀技", command: "↓↘→ + P", name: "波动拳", order: 1 },
      { character: "Ken", category: "必杀技", command: "→↓↘ + P", name: "昇龙拳", order: 2 },
      { character: "Ken", category: "Super Art", command: "↓↘→↓↘→ + K", name: "神龙拳", order: 3 },
      { character: " Yun", category: "必杀技", command: "↓↘→ + P", name: "铁山靠", order: 1 },
      { character: " Yun", category: "必杀技", command: "→↓↘ + K", name: "虎扑", order: 2 },
      { character: " Yun", category: "Super Art", command: "↓↘→↓↘→ + K", name: "幻影阵", order: 3 },
    ],
  },
  {
    title: "Super Mario World",
    slug: "super-mario-world",
    developer: "Nintendo",
    publisher: "Nintendo",
    releaseYear: 1990,
    description:
      "《超级马力欧世界》是任天堂在 1990 年随 SFC 推出的平台动作游戏。引入耀西骑乘系统，关卡设计精巧，被广泛认为是 2D 平台跳跃游戏的标杆。",
    gameplayText:
      "玩家控制马力欧穿越 7 个世界共 96 个关卡。新增耀西坐骑可以吞食敌人。关卡中隐藏了多条路径和秘密出口，探索性极强。",
    storyText:
      "马力欧和路易吉在耀西岛上度假时，库巴再次绑架了碧琪公主。马力欧必须借助耀西的力量，穿越各个世界拯救公主。",
    platformSlugs: ["snes"],
    genreSlugs: ["platformer", "action"],
    moves: [],
  },
  {
    title: "Sonic the Hedgehog 2",
    slug: "sonic-2",
    developer: "Sega",
    publisher: "Sega",
    releaseYear: 1992,
    description:
      "《索尼克 2》是世嘉在 1992 年推出的高速平台动作游戏。新增了双人模式和朋友塔尔斯作为可操作角色，以极快的速度和华丽的关卡设计著称。",
    gameplayText:
      "玩家控制索尼克（或塔尔斯的双人模式）高速穿越关卡。核心机制是旋转冲刺和收集金环。每个区域末尾需要击败蛋头博士。",
    platformSlugs: ["mega-drive"],
    genreSlugs: ["platformer", "action"],
    moves: [],
  },
  {
    title: "The Legend of Zelda: A Link to the Past",
    slug: "zelda-link-to-the-past",
    developer: "Nintendo",
    publisher: "Nintendo",
    releaseYear: 1991,
    description:
      "《塞尔达传说：众神的三角力量》是任天堂在 1991 年推出的动作冒险 RPG。定义了 2D 塞尔达的核心公式，引入光明/黑暗世界双地图系统。",
    gameplayText:
      "玩家操作林克在光明世界和黑暗世界之间穿梭，解谜、战斗、收集道具。游戏包含大量迷宫和隐藏要素，道具系统丰富。",
    platformSlugs: ["snes"],
    genreSlugs: ["rpg", "adventure", "action"],
    moves: [],
  },
  {
    title: "Mortal Kombat II",
    slug: "mortal-kombat-2",
    developer: "Midway",
    publisher: "Midway",
    releaseYear: 1993,
    description:
      "《真人快打 II》是 Midway 在 1993 年推出的格斗游戏。相比初代大幅改进，引入连续技系统和更多的残暴终结技（Fatality），以写实的血腥画面和神秘的东方风格闻名。",
    gameplayText:
      "5 键布局（拳、脚、防、高踢、低踢），独特的\"上上下下\"式必杀技输入。每个角色拥有多种终结技（Fatality, Friendship, Babality 等）。",
    platformSlugs: ["arcade", "snes", "mega-drive"],
    genreSlugs: ["fighting"],
    moves: [
      { character: "Liu Kang", category: "必杀技", command: "→→ + P", name: "飞踢", order: 1 },
      { character: "Liu Kang", category: "必杀技", command: "↓← + P", name: "火球", order: 2 },
      { character: "Liu Kang", category: "必杀技", command: "←← + K", name: "旋风腿", order: 3 },
      { character: "Liu Kang", category: "Fatality", command: "→←→←→←→ + 开始", name: "龙变", order: 4 },
      { character: "Scorpion", category: "必杀技", command: "←← + P", name: "标枪", order: 1 },
      { character: "Scorpion", category: "必杀技", command: "↓← + K", name: "传送", order: 2 },
      { character: "Scorpion", category: "Fatality", command: "↑↑ + 高踢", name: "火烧", order: 3 },
      { character: "Sub-Zero", category: "必杀技", command: "↓→ + P", name: "冰弹", order: 1 },
      { character: "Sub-Zero", category: "必杀技", command: "↓← + P", name: "地滑", order: 2 },
      { character: "Sub-Zero", category: "Fatality", command: "→↓← + 高踢", name: "冻裂", order: 3 },
    ],
  },
  {
    title: "Samurai Shodown II",
    slug: "samurai-shodown-2",
    developer: "SNK",
    publisher: "SNK",
    releaseYear: 1994,
    description:
      "《侍魂 II》是 SNK 在 1994 年推出的冷兵器格斗游戏。以武士对决为主题，强调一击必杀的心理战，怒槽系统和武器破坏技是其标志性系统。",
    gameplayText:
      "玩家操作来自不同时代的武士，使用刀剑等冷兵器进行对战。怒槽满时可使用武器破坏技或超必杀技。一局的胜负往往取决于一瞬间的决断。",
    platformSlugs: ["arcade", "neo-geo"],
    genreSlugs: ["fighting"],
    moves: [
      { character: "霸王丸", category: "必杀技", command: "↓↘→ + 斩", name: "奥义·旋風裂斬", order: 1 },
      { character: "霸王丸", category: "必杀技", command: "→↓↘ + 斩", name: "奥义·弧月斬", order: 2 },
      { character: "霸王丸", category: "超必杀技", command: "↓↘→↘↓↙← + 斩", name: "天覇封神斬", order: 3 },
      { character: "橘右京", category: "必杀技", command: "↓↘→ + 斩", name: "秘剣·ツバメ返し", order: 1 },
      { character: "橘右京", category: "必杀技", command: "→↓↘ + 踢", name: "非剣·細雪", order: 2 },
      { character: "娜可露露", category: "必杀技", command: "↓↙← + 斩", name: "風の刃", order: 1 },
      { character: "娜可露露", category: "必杀技", command: "←↓↙ + 斩", name: "アンヌムツベ", order: 2 },
    ],
  },
  {
    title: "Castlevania: Symphony of the Night",
    slug: "castlevania-sotn",
    developer: "Konami",
    publisher: "Konami",
    releaseYear: 1997,
    description:
      "《恶魔城：月下夜想曲》是 Konami 在 1997 年推出的动作角色扮演游戏。由五十岚孝司主导，开创了\"银河城\"（Metroidvania）玩法流派。",
    gameplayText:
      "玩家控制阿鲁卡多在庞大的德古拉城堡中探索。游戏引入 RPG 升级系统、装备系统和魔法系统。地图连通性强，隐藏要素极多。",
    storyText:
      "1797 年，德古拉被贝尔蒙特家族消灭四年后，一座神秘的城堡在雾中重现。德古拉之子阿鲁卡多为了阻止邪恶力量的复活，踏入了这座混沌之城。",
    platformSlugs: ["playstation"],
    genreSlugs: ["action", "rpg", "adventure"],
    moves: [],
  },
  {
    title: "Metal Slug",
    slug: "metal-slug",
    developer: "Nazca / SNK",
    publisher: "SNK",
    releaseYear: 1996,
    description:
      "《合金弹头》是 Nazca 开发、SNK 在 1996 年推出的街机横版射击游戏。以其精美的 2D 手绘像素画风、夸张的动画和幽默的风格成为街机射击游戏的经典。",
    gameplayText:
      "玩家操作角色穿越关卡，使用多种枪械（重机枪、霰弹枪、火焰枪等）消灭敌人。可以乘坐标志性的金属弹头战车，坦克车可以碾压敌人。",
    platformSlugs: ["arcade", "neo-geo"],
    genreSlugs: ["shooter", "action"],
    moves: [],
  },
  {
    title: "Final Fantasy VI",
    slug: "final-fantasy-6",
    developer: "Square",
    publisher: "Square",
    releaseYear: 1994,
    description:
      "《最终幻想 VI》是 Square 在 1994 年推出的角色扮演游戏。拥有 14 位可玩角色，以蒸汽朋克世界观和深刻的剧情叙事著称，被许多玩家评为 2D 时代最终幻想的巅峰。",
    gameplayText:
      "游戏采用 ATB（动态时间战斗）系统，14 名角色各有独特的战斗能力。通过魔石系统学习魔法，幻兽召唤是核心战斗机制之一。",
    platformSlugs: ["snes"],
    genreSlugs: ["rpg"],
    moves: [],
  },
  {
    title: "Mega Man 2",
    slug: "mega-man-2",
    developer: "Capcom",
    publisher: "Capcom",
    releaseYear: 1988,
    description:
      "《洛克人 2》是 Capcom 在 1988 年推出的动作平台游戏。元祖洛克人系列的经典之作，引入 8 个可选 Boss 的设计，击败 Boss 后获得其武器是该系列的标志性玩法。",
    gameplayText:
      "玩家操控洛克人，从 8 名 Robot Master 中选择顺序挑战。击败一个 Boss 后获得其特殊武器，利用相克关系挑战其他 Boss。",
    platformSlugs: ["nes"],
    genreSlugs: ["action", "platformer"],
    moves: [],
  },
]

async function main() {
  console.log("🌱 开始填充种子数据...")

  // 创建平台
  console.log("创建平台...")
  for (const p of platforms) {
    await prisma.platform.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
  }

  // 创建类型
  console.log("创建类型...")
  for (const g of genres) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    })
  }

  // 创建游戏
  console.log("创建游戏...")
  for (const game of games) {
    const created = await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: {
        title: game.title,
        slug: game.slug,
        developer: game.developer,
        publisher: game.publisher,
        releaseYear: game.releaseYear,
        description: game.description,
        gameplayText: game.gameplayText,
        storyText: game.storyText,
      },
    })

    // 关联平台
    for (const slug of game.platformSlugs) {
      const platform = await prisma.platform.findUnique({ where: { slug } })
      if (platform) {
        await prisma.gamePlatform.upsert({
          where: { gameId_platformId: { gameId: created.id, platformId: platform.id } },
          update: {},
          create: { gameId: created.id, platformId: platform.id },
        })
      }
    }

    // 关联类型
    for (const slug of game.genreSlugs) {
      const genre = await prisma.genre.findUnique({ where: { slug } })
      if (genre) {
        await prisma.gameGenre.upsert({
          where: { gameId_genreId: { gameId: created.id, genreId: genre.id } },
          update: {},
          create: { gameId: created.id, genreId: genre.id },
        })
      }
    }

    // 创建出招表
    if (game.moves.length > 0) {
      await prisma.moveList.createMany({
        data: game.moves.map((m) => ({
          gameId: created.id,
          character: m.character,
          category: m.category,
          command: m.command,
          name: m.name,
          description: m.description,
          damage: m.damage,
          order: m.order,
        })),
      })
    }

    console.log(`  ✓ ${game.title}`)
  }

  // 创建内置超级管理员
  const superAdminEmail = "creator@retroera.com"
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  })

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash("creator!)@$1024", 12)
    await prisma.user.create({
      data: {
        username: "RetroEra_Creator",
        email: superAdminEmail,
        password: hashedPassword,
        role: "super_admin",
      },
    })
    console.log("  ✓ 内置超级管理员 (RetroEra_Creator)")
  } else {
    console.log("  - 超级管理员已存在，跳过")
  }

  console.log("✅ 种子数据填充完成！")
}

main()
  .catch((e) => {
    console.error("❌ 种子数据填充失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
