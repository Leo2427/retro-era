import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
async function main() {
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const games = [
{en:"Appoooh",cn:"摔跤擂台",dev:"Sega",year:1984,desc:"Q版职业摔跤街机格斗游戏"},
{en:"Aquajack",cn:"战斗快艇",dev:"Taito",year:1989,desc:"驾驶武装气垫船射击的射击游戏"},
{en:"Arabian Fight",cn:"阿拉丁传奇",dev:"Sega",year:1991,desc:"天方夜谭背景横版清关动作游戏"},
{en:"Arabian",cn:"超级阿拉伯大冒险",dev:"Sunsoft",year:1983,desc:"阿拉伯王子营救公主的平台游戏"},
{en:"Arbalester",cn:"劲弩战机",dev:"SETA",year:1989,desc:"纵版射击游戏"},
{en:"Arcadia",cn:"阿卡迪亚战机",dev:"NMK",year:1994,desc:"纵版射击游戏"},
{en:"Arkanoid",cn:"快打砖块",dev:"Taito",year:1986,desc:"经典打砖块游戏"},
{en:"Arkanoid Revenge of DOH",cn:"快打砖块II",dev:"Taito",year:1987,desc:"打砖块系列续作"},
{en:"Arm Wrestling",cn:"掰手腕",dev:"Nintendo",year:1985,desc:"掰手腕对战游戏"},
{en:"Armed Formation",cn:"武装编队",dev:"Nichibutsu",year:1988,desc:"纵版卷轴射击游戏"},
{en:"Armed Police Batrider",cn:"蝙蝠骑警",dev:"Raizing",year:1998,desc:"纵版弹幕射击游戏"},
{en:"Armored Warriors",cn:"装甲战士",dev:"Capcom",year:1994,desc:"机甲横版清关游戏"},
{en:"Assault",cn:"突击",dev:"Namco",year:1988,desc:"坦克射击街机游戏"},
{en:"Asterix",cn:"高卢奇兵",dev:"Konami",year:1992,desc:"漫画改编横版动作游戏"},
{en:"Asteroids",cn:"爆破彗星",dev:"Atari",year:1979,desc:"经典矢量图形射击游戏"},
{en:"Asteroids Deluxe",cn:"爆破彗星豪华版",dev:"Atari",year:1980,desc:"爆破彗星增强版"},
{en:"Asura Blade Sword of Dynasty",cn:"血剑王朝",dev:"Fuuki",year:1998,desc:"2D格斗游戏"},
{en:"Atomic Robo-kid",cn:"原子机械童",dev:"UPL",year:1988,desc:"横版射击游戏"},
{en:"Avengers In Galactic Storm",cn:"上尉密令银河大乱斗",dev:"Data East",year:1995,desc:"漫威格斗游戏"},
{en:"Aztarac",cn:"太空舰队",dev:"Centuri",year:1983,desc:"彩色矢量射击游戏"},
{en:"Back Street Soccer",cn:"街头足球",dev:"SunA",year:1996,desc:"5对5花式足球"},
{en:"Backfire",cn:"越野房车大赛",dev:"Data East",year:1995,desc:"3D拉力赛车"},
{en:"Bad Dudes vs Dragonninja",cn:"龙之忍者",dev:"Data East",year:1988,desc:"横版清关动作游戏"},
{en:"Bad Lands",cn:"恶土",dev:"Atari",year:1989,desc:"武装赛车竞速"},
{en:"Bagman",cn:"推销员",dev:"Valadon",year:1982,desc:"迷宫收集游戏"},
{en:"Bakutotsu Kijuutei",cn:"爆突机铳艇",dev:"Namco",year:1988,desc:"卷轴射击游戏"},
{en:"Baluba-louk no Densetsu",cn:"巴鲁巴矿工传说",dev:"Able Corp",year:1986,desc:"平台动作游戏"},
{en:"Bank Panic",cn:"银行大盗",dev:"Sanritsu",year:1984,desc:"西部题材射击游戏"},
{en:"Baryon Future Assault",cn:"重子战机",dev:"SemiCom",year:1997,desc:"太空射击游戏"},
{en:"Batman",cn:"蝙蝠侠",dev:"Atari",year:1990,desc:"电影改编横版动作游戏"},
{en:"Battlantis",cn:"反战英雄",dev:"Konami",year:1987,desc:"固定射击游戏"},
{en:"Battle Bakraid Unlimited Version",cn:"战斗翔鹰",dev:"Raizing",year:1999,desc:"纵版弹幕射击游戏"},
{en:"Battle Circuit",cn:"战斗回路",dev:"Capcom",year:1997,desc:"横版清关动作游戏"},
{en:"Battle Cross",cn:"战斗飞梭",dev:"Omori",year:1982,desc:"纵版射击游戏"},
{en:"Battle Cruiser M-12",cn:"战斗巡洋舰M12",dev:"Sigma",year:1983,desc:"潜艇攻击游戏"},
{en:"Battle Lane Vol 5",cn:"战斗之路",dev:"Taito",year:1986,desc:"摩托车射击游戏"},
{en:"Battle Shark",cn:"战斗鲨鱼",dev:"Taito",year:1989,desc:"第一人称潜艇射击"},
{en:"Battle Zone",cn:"终极战区",dev:"Atari",year:1980,desc:"矢量坦克对战游戏"},
{en:"Battle of Atlantis",cn:"亚特兰蒂斯大作战",dev:"Game World",year:1981,desc:"潜艇射击"},
{en:"Battletoads",cn:"忍者蛙",dev:"Rare",year:1994,desc:"清版动作游戏"},
{en:"Bay Route",cn:"海湾行动",dev:"Sunsoft",year:1989,desc:"横版射击游戏"},
{en:"Berzerk",cn:"机器人战争",dev:"Stern",year:1980,desc:"迷宫射击游戏"},
{en:"Big Bucks",cn:"大款",dev:"Konami",year:1996,desc:"接金币收集游戏"},
{en:"Big Karnak",cn:"古埃及卡纳克传说",dev:"Gaelco",year:1991,desc:"横版动作游戏"},
{en:"Bio-ship Paladin",cn:"生化战舰帕拉丁",dev:"UPL",year:1990,desc:"横版射击"},
{en:"Bionic Commando",cn:"希魔复活",dev:"Capcom",year:1987,desc:"钩索攀爬动作射击"},
{en:"Birdie Try",cn:"高尔夫小鸟球",dev:"Data East",year:1988,desc:"高尔夫模拟游戏"},
{en:"Black Heart",cn:"黑暗之心",dev:"UPL",year:1991,desc:"横版射击"},
]

let ok = 0
for (const g of games) {
  const slug = g.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").replace(/'/g,"")
  try {
    await prisma.game.updateMany({
      where: { slug: { startsWith: slug.substring(0,15) } },
      data: { title: g.cn, titleEn: g.en, developer: g.dev, releaseYear: g.year, description: g.desc },
    })
    ok++
  } catch (e: any) { console.log(`❌ ${g.en}`) }
}
console.log(`更新: ${ok}/${games.length}`)
await prisma.$disconnect()
}
main().catch(console.error)
