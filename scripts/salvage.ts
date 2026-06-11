import fs from "fs"
import path from "path"

const WF_DIR = "C:/Users/21542/.claude/projects/D--LeoHo-Project-Web-RetroEra/3ce09920-568f-43fe-b78f-af27372452cc/subagents/workflows"
const results = []

function walkDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f)
    if (fs.statSync(fp).isDirectory()) { walkDir(fp); continue }
    if (!f.endsWith(".jsonl")) continue
    const content = fs.readFileSync(fp, "utf-8")
    for (const line of content.split("\n")) {
      try {
        const parsed = JSON.parse(line)
        const msg = parsed.message?.content
        if (!Array.isArray(msg)) continue
        for (const item of msg) {
          if (item.type === "tool_use" && item.name === "StructuredOutput" && item.input?.cn) {
            const i = item.input
            if (i.cn !== "未找到" && i.dev && i.dev !== "未知") {
              results.push({ cn: i.cn, en: "", dev: i.dev, year: parseInt(i.year) || 0, desc: i.desc || "" })
            }
          }
        }
      } catch {}
    }
  }
}

walkDir(WF_DIR)

const seen = new Set()
const unique = results.filter(r => { const k = r.cn; if (seen.has(k)) return false; seen.add(k); return true })

console.log(JSON.stringify(unique))
