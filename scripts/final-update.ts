import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const ALL = [
["88科乐美运动会","88 Games","Konami",1988,"体育合集游戏"],
["1941反击战","1941 Counter","Capcom",1990,"纵版卷轴射击"],
["1944征服世界","1944 Loop","Raizing",2000,"纵版射击"],
["19XX命运否决战","19XX War","Capcom",1995,"纵版射击"],
["四次元战士","4-D Warriors","Coreland",1985,"射击"],
["宇宙骑警","AB Cop","Aicom",1990,"竞速射击"],
["风云战机","Acrobat Mission","UPL",1991,"纵版射击"],
["动作格斗","Action Fighter","Sega",1986,"俯视角射击"],
["四国战机","Aero Fighters","Video System",1992,"纵版射击"],
["冲破火网2","After Burner","Sega",1987,"飞行射击"],
["超级特工邦德","Agent Super Bond","Alpha",1985,"俯视角射击"],
["空中突击","Air Assault","Irem",1993,"纵版射击"],
["空袭","Air Attack","Comad",1996,"纵版射击"],
["空战双鹰","Air Duel","Irem",1990,"纵版射击"],
["飞狼","Airwolf","Kyugo",1987,"横版射击"],
["飓风战机","Ajax","Konami",1987,"纵版射击"],
["组合战机","Alcon","Toaplan",1986,"纵版射击"],
["异形风暴","Alien Syndrome","Sega",1987,"俯视角射击"],
["异形对铁血战士","Alien vs Predator","Capcom",1994,"横版清关"],
["鳄鱼猎人","Alligator Hunt","Gaelco",1994,"射击"],
["兽王记","Altered Beast","Sega",1988,"横版动作"],
["画线","Amidar","Konami",1981,"益智"],
["食蚁兽","Anteater","Stern",1982,"益智"],
["装甲车","Armored Car","Stern",1981,"动作"],
["雪人兄弟","Snow Bros","Toaplan",1990,"平台动作"],
["雪人兄弟2","Snow Bros 2","Toaplan",1994,"平台动作"],
["落日骑士","Sunset Riders","Konami",1991,"横版射击"],
["出击飞龙","Strider","Capcom",1989,"横版动作"],
["出击飞龙2","Strider 2","Capcom",1999,"横版动作"],
["超级忍","Shinobi","Sega",1987,"横版动作"],
["影舞者","Shadow Dancer","Sega",1989,"横版动作"],
["异形","Aliens","Konami",1990,"横版射击"],
["铁钩船长","Hook","Irem",1992,"横版清关"],
["午夜杀生","Night Slashers","Data East",1993,"横版清关"],
["惩罚者","Punisher","Capcom",1993,"横版清关"],
["圆桌骑士","Knights of the Round","Capcom",1991,"横版清关"],
["快打旋风","Final Fight","Capcom",1989,"横版清关"],
["战斗回路","Battle Circuit","Capcom",1997,"横版清关"],
["装甲战士","Armored Warriors","Capcom",1994,"横版清关"],
["恐龙快打","Cadillacs Dinosaurs","Capcom",1993,"横版清关"],
["龙王战士","King of Dragons","Capcom",1991,"横版清关"],
["名将","Captain Commando","Capcom",1991,"横版清关"],
["三国志","Warriors of Fate","Capcom",1992,"横版清关"],
]

async function main() {
const p = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})
var games = await p.game.findMany({
  where: { description: "街机经典游戏", platforms: { some: { platform: { slug: "arcade" } } } },
  select: { id: true, slug: true, title: true },
})
var ok = 0
for (const [cn, keyword, dev, year, desc] of ALL) {
  const k = keyword.toLowerCase().replace(/[^a-z0-9]/g,"")
  for (const g of games) {
    const s = g.slug.toLowerCase()
    const t = g.title.toLowerCase().replace(/[^a-z0-9]/g,"")
    if (s.includes(k) || t.includes(k)) {
      await p.game.update({ where: { id: g.id }, data: { title: cn, developer: dev, releaseYear: year, description: desc } })
      ok++
      games = games.filter(x => x.id !== g.id)
      break
    }
  }
}
console.log(`本次更新: ${ok}/${ALL.length} 款`)
console.log(`仍有 ${games.length} 款待补充`)
await p.$disconnect()
}
main().catch(console.error)
