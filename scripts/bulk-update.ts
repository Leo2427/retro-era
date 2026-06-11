import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const data = [
["appoooh","摔跤擂台","Appoooh","Sega",1984,"Q版职业摔跤","fighting"],
["aquajack","战斗快艇","Aquajack","Taito",1989,"气垫船射击","shooter"],
["arabian-fight","阿拉丁传奇","Arabian Fight","Sega",1991,"横版清关","action"],
["arkanoid","快打砖块","Arkanoid","Taito",1986,"经典打砖块","action"],
["asteroids","爆破彗星","Asteroids","Atari",1979,"矢量射击","shooter"],
["bionic-commando","希魔复活","Bionic Commando","Capcom",1987,"钩索攀爬","action"],
["commando","战场之狼","Commando","Capcom",1985,"顶视角射击","shooter"],
["columns","宝石方块","Columns","Sega",1990,"三消益智","action"],
["cotton","棉花小魔女","Cotton","Success",1994,"横版射击","shooter"],
["donkey-kong","大金刚","Donkey Kong","Nintendo",1981,"平台跳跃","action"],
["dig-dug","打空气","Dig Dug","Namco",1982,"膨胀敌人","action"],
["final-fight","快打旋风","Final Fight","Capcom",1989,"横版清关","action"],
["galaga","大蜜蜂","Galaga","Namco",1981,"经典射击","shooter"],
["galaxian","小蜜蜂","Galaxian","Namco",1979,"经典射击","shooter"],
["golden-axe","战斧","Golden Axe","Sega",1989,"横版清关","action"],
["kung-fu-master","成龙踢馆","Kung Fu Master","Irem",1984,"横版清关","action"],
["pac-man","吃豆人","Pac-Man","Namco",1980,"迷宫经典","action"],
["raiden","雷电","Raiden","Seibu",1990,"纵版射击","shooter"],
["rtype","R-Type","R-Type","Irem",1987,"横版射击","shooter"],
["shinobi","超级忍","Shinobi","Sega",1987,"横版动作","action"],
["space-invaders","太空侵略者","Space Invaders","Taito",1978,"固定射击","shooter"],
["strider","出击飞龙","Strider","Capcom",1989,"横版动作","action"],
["sunset-riders","落日骑士","Sunset Riders","Konami",1991,"横版射击","shooter"],
]

async function main() {
const p = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})
var genres = await p.genre.findMany()
var genreMap = {}
genres.forEach(g => genreMap[g.slug] = g.id)
var arcade = await p.platform.findUnique({where:{slug:"arcade"}})

var ok = 0
for (const [slugPrefix, cn, en, dev, year, desc, genre] of data) {
  var games = await p.game.findMany({
    where: { slug: { startsWith: slugPrefix }, platforms: { some: { platform: { slug: "arcade" } } } },
    select: { id: true }, take: 1
  })
  if (games.length > 0) {
    await p.game.update({ where: { id: games[0].id }, data: { title: cn, titleEn: en, developer: dev, releaseYear: year, description: desc } })
    if (genreMap[genre] && arcade) {
      await p.gameGenre.deleteMany({ where: { gameId: games[0].id } })
      await p.gameGenre.create({ data: { gameId: games[0].id, genreId: genreMap[genre] } })
    }
    ok++
  }
}
console.log(`更新: ${ok}/${data.length}`)
await p.$disconnect()
}
main().catch(console.error)
