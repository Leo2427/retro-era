import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const games = [
{en:"B-Wings",cn:"B计划",dev:"Data East",year:1984,desc:"竖版卷轴射击"},
{en:"Blood Bros",cn:"热血兄弟",dev:"TAD",year:1990,desc:"西部题材射击"},
{en:"Bloody Wolf",cn:"血狼",dev:"Data East",year:1988,desc:"俯视角射击"},
{en:"Bomb Jack Twin",cn:"炸弹杰克双子星",dev:"NMK",year:1993,desc:"平台动作"},
{en:"Bonze Adventure",cn:"地狱小和尚",dev:"Taito",year:1988,desc:"和尚投掷佛珠驱散恶灵"},
{en:"Boogie Wings",cn:"钩子战机",dev:"Data East",year:1992,desc:"横版卷轴射击"},
{en:"Boot Camp",cn:"新兵训练营",dev:"Konami",year:1987,desc:"军事训练"},
{en:"Bouncing Balls",cn:"跳舞球",dev:"Comad",year:1991,desc:"益智"},
{en:"Bowl-O-Rama",cn:"保龄球大赛",dev:"P&P",year:1991,desc:"保龄球"},
{en:"Boxy Boy",cn:"仓库番",dev:"Namco",year:1990,desc:"推箱子解谜"},
{en:"Brute Force",cn:"强力斗士",dev:"Leland",year:1991,desc:"动作过关"},
{en:"Bubble 2000",cn:"泡泡2000",dev:"Tuning",year:1998,desc:"消消乐射击"},
{en:"Bubble Bobble",cn:"泡泡龙",dev:"Taito",year:1986,desc:"经典泡泡射击"},
{en:"Bubble Symphony",cn:"泡泡交响曲",dev:"Taito",year:1994,desc:"泡泡龙系列"},
{en:"Buck Rogers",cn:"巴克罗杰斯",dev:"Sega",year:1982,desc:"伪3D轨道射击"},
{en:"Bump n Jump",cn:"金龜跳車",dev:"Data East",year:1982,desc:"赛车战斗"},
{en:"Burning Fight",cn:"燃烧战火",dev:"SNK",year:1991,desc:"清版动作"},
{en:"Cabaret",cn:"卡巴莱秀",dev:"AMT",year:1992,desc:"扑克"},
{en:"Cactus",cn:"仙人掌炸弹人",dev:"NMK",year:1992,desc:"平台动作"},
{en:"Cage",cn:"铁笼",dev:"Unknown",year:1981,desc:"固定射击"},
{en:"Capcom Baseball",cn:"卡普空棒球",dev:"Capcom",year:1989,desc:"棒球"},
{en:"Carnival",cn:"嘉年华",dev:"Gremlin",year:1980,desc:"固定射击"},
{en:"Cerberus",cn:"防卫卫星",dev:"Cinematronics",year:1985,desc:"射击"},
{en:"Challenger",cn:"列车寻宝",dev:"Hudson",year:1985,desc:"列车平台动作"},
{en:"Champion Baseball",cn:"冠军棒球",dev:"Alpha Denshi",year:1983,desc:"棒球"},
{en:"Champion Boxing",cn:"冠军拳击",dev:"Sega",year:1984,desc:"拳击"},
{en:"Champion Wrestler",cn:"冠军摔跤",dev:"Taito",year:1989,desc:"摔跤"},
{en:"Chase Bombers",cn:"追逐轰炸车",dev:"Taito",year:1994,desc:"赛车竞速"},
{en:"Cheeky Mouse",cn:"俏皮老鼠",dev:"Universal",year:1980,desc:"打老鼠"},
{en:"China Gate",cn:"西游降魔录",dev:"Technos",year:1988,desc:"西游横版动作"},
{en:"Chinese Hero",cn:"超级中国人",dev:"Nihon Game",year:1984,desc:"武术清版"},
{en:"Choplifter",cn:"救援直升机",dev:"Sega",year:1985,desc:"直升机营救"},
{en:"Circus Charlie",cn:"马戏团",dev:"Konami",year:1984,desc:"马戏团平台"},
{en:"City Bomber",cn:"炸弹赛车",dev:"Konami",year:1987,desc:"载具战斗"},
{en:"Clash Road",cn:"冲撞自行车",dev:"Woodplace",year:1986,desc:"自行车竞速"},
{en:"Colony 7",cn:"殖民地7号",dev:"Taito",year:1981,desc:"固定射击"},
{en:"Columns",cn:"宝石方块",dev:"Sega",year:1990,desc:"三消益智"},
{en:"Combat Hawk",cn:"战斗之鹰",dev:"Sanritsu",year:1987,desc:"射击"},
{en:"Combat School",cn:"战斗学校",dev:"Konami",year:1987,desc:"军事训练"},
{en:"Command War",cn:"超级战斗棋",dev:"Taito",year:1992,desc:"战棋策略"},
{en:"Commando",cn:"战场之狼",dev:"Capcom",year:1985,desc:"顶视角射击"},
{en:"Conquer",cn:"征服者",dev:"Unknown",year:1980,desc:"射击"},
{en:"Cook Race",cn:"烤肉大赛",dev:"Unknown",year:1982,desc:"厨师制作汉堡"},
{en:"Cosmic Avenger",cn:"宇宙复仇者",dev:"Universal",year:1981,desc:"横卷轴射击"},
{en:"Cosmic Cop",cn:"宇宙战警",dev:"Irem",year:1991,desc:"横版射击"},
{en:"Cotton",cn:"棉花小魔女",dev:"Success",year:1994,desc:"横版射击"},
{en:"Crime City",cn:"罪恶都市",dev:"Taito",year:1989,desc:"横版动作射击"},
{en:"Crisis Force",cn:"帝国战机",dev:"Konami",year:1991,desc:"纵版射击"},
{en:"Cross Shooter",cn:"空中袭击",dev:"Seibu",year:1987,desc:"纵版射击"},
{en:"Crossed Swords",cn:"圣十字剑",dev:"Alpha Denshi",year:1991,desc:"动作RPG"},
]

let ok = 0
for (const g of games) {
  const slug = g.en.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").replace(/'/g,"")
  try {
    const r = await prisma.game.updateMany({
      where: { slug: { startsWith: slug.substring(0, 12) } },
      data: { title: g.cn, titleEn: g.en, developer: g.dev, releaseYear: g.year, description: g.desc },
    })
    if (r.count > 0) ok++
  } catch {}
}
console.log(`更新: ${ok}/${games.length}`)
await prisma.$disconnect()
}
main().catch(console.error)
