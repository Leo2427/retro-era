import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
async function main() {
const p = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})
var total = await p.game.count({where:{platforms:{some:{platform:{slug:"arcade"}}}}})
var withCN = await p.game.count({where:{titleEn:{not:null},platforms:{some:{platform:{slug:"arcade"}}}}})
var withoutCN = await p.game.count({where:{titleEn:null,platforms:{some:{platform:{slug:"arcade"}}}}})
console.log("街机总数:", total, "有中文名:", withCN, "缺中文名:", withoutCN)
await p.$disconnect()
}
main().catch(console.error)
