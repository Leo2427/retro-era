import "dotenv/config"
import fs from "fs"
import path from "path"

const COVERS_DIR = "D:/LeoHo/Project/GameBase/game_covers/FBNeo - Arcade Games/Named_Boxarts"
const COVERS_DIR2 = "D:/LeoHo/Project/GameBase/game_covers/MAME/Named_Boxarts"
const API_BASE = "http://localhost:3000"
const ADMIN_EMAIL = "215424056@qq.com"
const ADMIN_PASS = "he311986"

function cleanGameName(filename: string): string {
  let name = filename.replace(/\.png$/i, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/,?\s*(FD\d+|315-\d+|set\s*\d+|World|US|Japan|Euro|Asia|rev\s*\d+)/gi, "")
    .replace(/\s+/g, " ").trim()
  return name || filename.replace(/\.png$/i, "")
}

async function main() {
  const files: string[] = []
  for (const dir of [COVERS_DIR, COVERS_DIR2]) {
    if (fs.existsSync(dir)) {
      files.push(...fs.readdirSync(dir).filter(f => f.endsWith(".png")).map(f => path.join(dir, f)))
    }
  }
  console.log(`总共 ${files.length} 个封面`)

  const batch = files.slice(0, 5)
  for (const filePath of batch) {
    const filename = path.basename(filePath)
    const gameName = cleanGameName(filename)
    console.log(`\n处理: ${filename} → ${gameName}`)
  }
}

main().catch(console.error)
