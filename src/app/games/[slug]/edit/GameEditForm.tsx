"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImageUploader } from "@/components/admin/ImageUploader"

interface Platform {
  id: string
  name: string
  slug: string
}

interface Genre {
  id: string
  name: string
  slug: string
}

interface Move {
  id: string
  character: string | null
  category: string
  command: string
  name: string | null
  description: string | null
  damage: string | null
  order: number
}

interface GameData {
  id: string
  title: string
  titleEn: string | null
  slug: string
  developer: string | null
  publisher: string | null
  releaseYear: number | null
  description: string | null
  gameplayText: string | null
  storyText: string | null
  coverImageUrl: string | null
  platforms: { platform: Platform }[]
  genres: { genre: Genre }[]
  moveLists: Move[]
}

interface Props {
  game: GameData
  allPlatforms: Platform[]
  allGenres: Genre[]
}

export function GameEditForm({ game, allPlatforms, allGenres }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const [form, setForm] = useState({
    title: game.title,
    titleEn: game.titleEn || "",
    developer: game.developer || "",
    publisher: game.publisher || "",
    releaseYear: game.releaseYear?.toString() || "",
    description: game.description || "",
    gameplayText: game.gameplayText || "",
    storyText: game.storyText || "",
  })

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    game.platforms.map((gp) => gp.platform.id)
  )
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    game.genres.map((gg) => gg.genre.id)
  )

  // 封面 URL（上传后更新）
  const [coverUrl, setCoverUrl] = useState(game.coverImageUrl || "")

  // 出招表编辑器状态
  const [moves, setMoves] = useState<Move[]>(game.moveLists)
  const [newMove, setNewMove] = useState({
    character: "",
    category: "必杀技",
    command: "",
    name: "",
  })

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function toggleGenre(id: string) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  function addMove() {
    if (!newMove.command) return
    setMoves((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        character: newMove.character || null,
        category: newMove.category,
        command: newMove.command,
        name: newMove.name || null,
        description: null,
        damage: null,
        order: prev.length,
      },
    ])
    setNewMove({ character: "", category: "必杀技", command: "", name: "" })
  }

  function removeMove(id: string) {
    setMoves((prev) => prev.filter((m) => m.id !== id))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch(`/api/admin/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          releaseYear: form.releaseYear ? parseInt(form.releaseYear) : null,
          titleEn: form.titleEn || null,
          coverImageUrl: coverUrl,
          platforms: selectedPlatforms,
          genres: selectedGenres,
          moves: moves.map(({ id, ...rest }) => rest),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage("保存成功 ✓")
        router.refresh()
      } else {
        setMessage("保存失败: " + (data.error || ""))
      }
    } catch {
      setMessage("保存失败，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-8">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">编辑: {game.title}</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            <Link href={`/games/${game.slug}`} className="hover:text-accent">
              查看详情 →
            </Link>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/games"
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:bg-border/50"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            message.includes("成功")
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-accent/30 bg-accent/5 text-accent"
          }`}
        >
          {message}
        </div>
      )}

      {/* 基本信息 */}
      <section>
        <h2 className="mb-3 text-base font-semibold">基本信息</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-text">游戏名称（中文）</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text">游戏名称（英文）</label>
            <input
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted"
              placeholder="Street Fighter II Turbo"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text">发行年份</label>
            <input
              type="number"
              value={form.releaseYear}
              onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text">开发商</label>
            <input
              value={form.developer}
              onChange={(e) => setForm({ ...form, developer: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text">发行商</label>
            <input
              value={form.publisher}
              onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted"
            />
          </div>
        </div>
      </section>

      {/* 平台 & 类型 */}
      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-base font-semibold">平台</h2>
          <div className="flex flex-wrap gap-2">
            {allPlatforms.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selectedPlatforms.includes(p.id)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-text-muted hover:border-text-muted/30"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">类型</h2>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGenre(g.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selectedGenres.includes(g.id)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-text-muted hover:border-text-muted/30"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* 游戏封面上传 */}
      <section>
        <h2 className="mb-3 text-base font-semibold">游戏封面</h2>
        <ImageUploader
          currentUrl={game.coverImageUrl}
          type="cover"
          slug={game.slug}
          onUploaded={setCoverUrl}
          label="点击上传或更换封面图"
        />
      </section>

      {/* 文本编辑器 */}
      {(["description", "gameplayText", "storyText"] as const).map((field) => (
        <section key={field}>
          <h2 className="mb-3 text-base font-semibold">
            {field === "description"
              ? "游戏介绍"
              : field === "gameplayText"
              ? "玩法概述"
              : "故事背景"}
          </h2>
          <textarea
            rows={6}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-text-muted"
            placeholder={`输入${field === "description" ? "游戏介绍" : field === "gameplayText" ? "玩法概述" : "故事背景"}...`}
          />
        </section>
      ))}

      {/* 出招表编辑器 */}
      <section>
        <h2 className="mb-3 text-base font-semibold">出招表管理</h2>

        {/* 添加新招式 */}
        <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-border bg-bg/50 p-3">
          <div>
            <label className="text-xs text-text-muted">角色</label>
            <input
              value={newMove.character}
              onChange={(e) => setNewMove({ ...newMove, character: e.target.value })}
              className="mt-0.5 block w-24 rounded border border-border bg-surface px-2 py-1 text-sm outline-none"
              placeholder="角色名"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">分类</label>
            <select
              value={newMove.category}
              onChange={(e) => setNewMove({ ...newMove, category: e.target.value })}
              className="mt-0.5 block rounded border border-border bg-surface px-2 py-1 text-sm outline-none"
            >
              <option>必杀技</option>
              <option>超必杀技</option>
              <option>普通技</option>
              <option>投技</option>
              <option>Fatality</option>
              <option>Super Art</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted">招式名称</label>
            <input
              value={newMove.name}
              onChange={(e) => setNewMove({ ...newMove, name: e.target.value })}
              className="mt-0.5 block w-28 rounded border border-border bg-surface px-2 py-1 text-sm outline-none"
              placeholder="名称"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">指令</label>
            <input
              value={newMove.command}
              onChange={(e) => setNewMove({ ...newMove, command: e.target.value })}
              className="mt-0.5 block w-40 rounded border border-border bg-surface px-2 py-1 text-sm outline-none"
              placeholder="↓↘→ + P"
            />
          </div>
          <button
            type="button"
            onClick={addMove}
            className="rounded bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-hover"
          >
            + 添加
          </button>
        </div>

        {/* 招式列表 */}
        {moves.length === 0 ? (
          <p className="text-sm text-text-muted">暂无招式数据</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-bg text-xs text-text-muted">
                  <th className="px-3 py-2 font-medium">角色</th>
                  <th className="px-3 py-2 font-medium">分类</th>
                  <th className="px-3 py-2 font-medium">名称</th>
                  <th className="px-3 py-2 font-medium">指令</th>
                  <th className="px-3 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-3 py-2 text-text-muted">{m.character || "-"}</td>
                    <td className="px-3 py-2 text-text-muted">{m.category}</td>
                    <td className="px-3 py-2 text-text">{m.name || "-"}</td>
                    <td className="px-3 py-2 font-mono text-sm text-accent">{m.command}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeMove(m.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </form>
  )
}
