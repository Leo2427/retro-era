import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
async function main() {
const adapter = new PrismaPg({connectionString:process.env.DATABASE_URL!})
const prisma = new PrismaClient({adapter})
const g=[{e:"Crusher",c:"粉碎者",d:"Takumi",y:1999,s:"液压机压碎砖块"},{e:"Crystal Castles",c:"水晶城堡",d:"Atari",y:1983,s:"收集宝石躲避敌人"},{e:"Cup Final",c:"泰托杯决赛",d:"Taito",y:1993,s:"足球游戏"},{e:"Cutie Q",c:"可爱Q",d:"Namco",y:1979,s:"弹球打砖块"},{e:"Cybattler",c:"战斗机械",d:"Jaleco",y:1993,s:"纵版机甲射击"},{e:"Cycle Warriors",c:"摩托战士",d:"Tatsumi",y:1988,s:"摩托战斗"},{e:"D-Day",c:"D日",d:"Jaleco",y:1984,s:"纵版射击"},{e:"Damage",c:"伤害",d:"Suomi-Peli",y:1996,s:"2D动作射击"},{e:"Dan-Ku-Ga",c:"断仇牙",d:"Taito",y:1994,s:"2D格斗"},{e:"Dangerous Seed",c:"危机之种",d:"Namco",y:1989,s:"纵版射击"},{e:"Dark Planet",c:"黑暗星球",d:"Stern",y:1982,s:"3D太空射击"},{e:"Dark Seal",c:"黑暗封印",d:"Data East",y:1990,s:"动作RPG"},{e:"Dead Connection",c:"死亡边缘",d:"Taito",y:1992,s:"光枪射击"},{e:"Dead Eye",c:"神射手",d:"Meadows",y:1978,s:"光枪射击"},{e:"Deep Scan",c:"深海扫描",d:"Sega",y:1979,s:"海战射击"},{e:"Demon Front",c:"魔域战线",d:"IGS",y:2002,s:"横版射击"},{e:"Derby Dream",c:"赛马问答",d:"Namco",y:1998,s:"问答赛马"},{e:"Desert Assault",c:"霹雳神兵",d:"Data East",y:1991,s:"射击"},{e:"Devil World",c:"恶魔世界",d:"Nintendo",y:1984,s:"迷宫"},{e:"Devilish",c:"恶魔弹珠台",d:"Opera House",y:1991,s:"弹球"},{e:"Diamond Run",c:"钻石狂奔",d:"KH Video",y:1989,s:"迷宫益智"},{e:"Dice",c:"骰子大作战",d:"Taito",y:1990,s:"消除"},{e:"Dig Dug",c:"打空气",d:"Namco",y:1982,s:"挖掘膨胀敌人"},{e:"Dig Dug II",c:"打空气II",d:"Namco",y:1985,s:"挖掘膨胀"},{e:"Dimahoo",c:"疾风魔法大作战2",d:"Raizing",y:2000,s:"纵版弹幕射击"},{e:"Dino Rex",c:"恐龙",d:"Taito",y:1992,s:"恐龙格斗"},{e:"Dirty Pig",c:"脏橄榄球",d:"Sammy",y:2004,s:"橄榄球"},{e:"Do Donpachi",c:"怒首领蜂",d:"Cave",y:1997,s:"弹幕射击"},{e:"Dog Fight",c:"空中缠斗",d:"Technos",y:1984,s:"空战"},{e:"Dog Race",c:"赛狗",d:"Unknown",y:1980,s:"赛狗"},{e:"Donkey Kong",c:"大金刚",d:"Nintendo",y:1981,s:"平台跳跃"},{e:"Donkey Kong 3",c:"大金刚3",d:"Nintendo",y:1983,s:"射击"},{e:"Donkey Kong Jr",c:"大金刚Jr",d:"Nintendo",y:1982,s:"攀爬平台"},{e:"Dori",c:"噗哟噗哟通",d:"Compile",y:1994,s:"方块消除"},{e:"Double Wings",c:"双翼",d:"Mitchell",y:1993,s:"纵版射击"},{e:"Dragon Blaze",c:"龙之光辉",d:"Psikyo",y:2000,s:"纵版射击"},{e:"Dragon Breed",c:"神龙太子",d:"Irem",y:1989,s:"横版射击"},{e:"Dragon Dance",c:"龙之舞",d:"Natsume",y:1998,s:"打砖块"},{e:"Dragon Gun",c:"龙枪",d:"Data East",y:1992,s:"光枪射击"},{e:"Dragon Master",c:"龙之主",d:"UNiCO",y:1994,s:"格斗"},{e:"Dragon Saber",c:"龙之剑",d:"Namco",y:1990,s:"纵版射击"},{e:"Dragon Spirit",c:"龙之精灵",d:"Namco",y:1987,s:"纵版射击"},{e:"Dragon Unit",c:"龙之军团",d:"Athena",y:1989,s:"横版动作"},{e:"Dunk Dream",c:"街头篮球",d:"Data East",y:1994,s:"3对3篮球"},{e:"Dynablaster",c:"炸弹人",d:"Irem",y:1991,s:"放置炸弹"},
]
let ok=0
for(const x of g){
const slug=x.e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").replace(/'/g,"")
try{const r=await prisma.game.updateMany({where:{slug:{startsWith:slug.substring(0,12)}},data:{title:x.c,titleEn:x.e,developer:x.d,releaseYear:x.y,description:x.s}});if(r.count>0)ok++}catch{}
}
console.log("更新:",ok+"/"+g.length)
await prisma.$disconnect()
}
main().catch(console.error)
