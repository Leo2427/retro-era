import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
async function main() {
const p = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})
var g = await p.game.findMany({where:{platforms:{some:{platform:{slug:"arcade"}}}},select:{title:true,titleEn:true,slug:true},take:500,orderBy:{slug:"asc"}})
var noCN = g.filter(x => !x.titleEn && x.title.length < 30)
console.log("总街机:", g.length)
console.log("缺中文名:", noCN.length)
console.log("前30个缺中文名的:")
noCN.slice(0,30).forEach(x => console.log(x.slug,"-",x.title))
await p.$disconnect()
}
main().catch(console.error)
