import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
async function main() {
const p = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})
var allGames = await p.game.findMany({where:{titleEn:null,platforms:{some:{platform:{slug:"arcade"}}}},select:{id:true,slug:true,title:true}})
const d=[
{en:"Fighter's History",cn:"斗士之历史",d:"Data East",y:1993,s:"2D格斗"},{en:"Fighting Basketball",cn:"战斗篮球",d:"Paradise",y:1984,s:"篮球格斗"},{en:"Fighting Golf",cn:"战斗高尔夫",d:"SNK",y:1988,s:"高尔夫"},{en:"Fighting Ice Hockey",cn:"战斗冰球",d:"Data East",y:1984,s:"冰球"},{en:"Fighting Soccer",cn:"战斗足球",d:"SNK",y:1988,s:"足球"},{en:"Final Fight",cn:"快打旋风",d:"Capcom",y:1989,s:"横版清关"},{en:"Fire Shark",cn:"鲛鲛鲛",d:"Toaplan",y:1989,s:"纵版射击"},{en:"Flicky",cn:"弗利奇",d:"Sega",y:1984,s:"平台跳跃"},{en:"Frogger",cn:"青蛙过河",d:"Konami",y:1981,s:"经典"},{en:"G-Loc",cn:"G-LOC空战",d:"Sega",y:1990,s:"空战"},{en:"Galaga",cn:"大蜜蜂",d:"Namco",y:1981,s:"经典射击"},{en:"Galaxian",cn:"小蜜蜂",d:"Namco",y:1979,s:"经典射击"},{en:"Garou",cn:"狼之印记",d:"SNK",y:1999,s:"格斗"},{en:"Gate of Doom",cn:"暗黑封印",d:"Data East",y:1990,s:"动作RPG"},{en:"Geostorm",cn:"钢炮部队",d:"Irem",y:1994,s:"横版射击"},
]
let ok=0
for(const x of d){
const c=x.en.toLowerCase().replace(/[^a-z0-9]/g,"")
const m=allGames.find(g=>{const t=g.title.toLowerCase().replace(/[^a-z0-9]/g,"");return t.includes(c)||c.includes(t)||g.slug.includes(c.substring(0,8))})
if(m){await p.game.update({where:{id:m.id},data:{title:x.cn,titleEn:x.en,developer:x.d,releaseYear:x.y,description:x.s}});ok++;allGames=allGames.filter(g=>g.id!==m.id)}
}
console.log("更新:",ok+"/"+d.length)
await p.$disconnect()
}
main().catch(console.error)
