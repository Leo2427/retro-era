import fs from "fs"
import path from "path"

const WF_DIR = "C:/Users/21542/.claude/projects/D--LeoHo-Project-Web-RetroEra/3ce09920-568f-43fe-b78f-af27372452cc/subagents/workflows"
const results = []

for (const dir of fs.readdirSync(WF_DIR)) {
  const dirPath = path.join(WF_DIR, dir)
  if (!fs.statSync(dirPath).isDirectory()) continue
  for (const file of fs.readdirSync(dirPath)) {
    if (!file.endsWith(".jsonl")) continue
    const content = fs.readFileSync(path.join(dirPath, file), "utf-8")
    for (const line of content.split("\n")) {
      try {
        const parsed = JSON.parse(line)
        if (parsed.result?.cn && parsed.result?.en) {
          results.push({ cn: parsed.result.cn, en: parsed.result.en, dev: parsed.result.dev || "", year: parsed.result.year || 0, desc: parsed.result.desc || "" })
        }
        if (Array.isArray(parsed.result) && parsed.result[0]?.cn) {
          for (const r of parsed.result) {
            if (r.cn && r.en) results.push({ cn: r.cn, en: r.en, dev: r.dev || "", year: r.year || 0, desc: r.desc || "" })
          }
        }
      } catch {}
    }
  }
}

const seen = new Set()
const unique = results.filter(r => { const k = r.en.toLowerCase().trim(); if (seen.has(k)) return false; seen.add(k); return true })

console.log(JSON.stringify(unique))
