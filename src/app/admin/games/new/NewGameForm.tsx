"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Platform { id: string; name: string; slug: string }
interface Genre { id: string; name: string; slug: string }

interface Props {
  allPlatforms: Platform[]
  allGenres: Genre[]
}

export function NewGameForm({ allPlatforms, allGenres }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    title: "",
    titleEn: "",
    slug: "",
    developer: "",
    publisher: "",
    releaseYear: "",
    autoSlug: true,
  })
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  function genSlug(title: string, titleEn: string): string {
    const src = titleEn || title
    const slug = src.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    return slug || `game-${Date.now()}`
  }

  function handleTitleChange(title: string) {
    setForm((prev) => {
      if (!prev.autoSlug) return { ...prev, title }
      return { ...prev, title, slug: genSlug(title, prev.titleEn) }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          titleEn: form.titleEn || null,
          slug: form.slug,
          developer: form.developer,
          publisher: form.publisher,
          releaseYear: form.releaseYear ? parseInt(form.releaseYear) : null,
          platforms: selectedPlatforms,
          genres: selectedGenres,
        }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || "创建失败")
        return
      }

      router.push(`/games/${data.data.slug}/edit`)
    } catch {
      setError("创建失败，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">新建游戏</h1>
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
            {saving ? "创建中..." : "创建并编辑"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm text-accent">
          {error}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold">基本信息</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-text">游戏名称（中文）*</label>
            <input
              required
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-text">游戏名称（英文）</label>
            <input
              value={form.titleEn}
              onChange={(e) => {
                const titleEn = e.target.value
                setForm((prev) => {
                  if (!prev.autoSlug) return { ...prev, titleEn }
                  return { ...prev, titleEn, slug: genSlug(prev.title, titleEn) }
                })
              }}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted"
              placeholder="Street Fighter II Turbo"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-text">
              URL 标识
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, autoSlug: !p.autoSlug }))}
                className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                  form.autoSlug ? "bg-accent/10 text-accent" : "bg-border/50 text-text-muted"
                }`}
              >
                {form.autoSlug ? "自动" : "手动"}
              </button>
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value, autoSlug: false }))}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted font-mono"
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
          <div>
            <label className="text-sm font-medium text-text">发行年份</label>
            <input
              type="number"
              value={form.releaseYear}
              onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text-muted"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">平台</h2>
        <div className="flex flex-wrap gap-2">
          {allPlatforms.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlatforms((prev) =>
                prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
              )}
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
              onClick={() => setSelectedGenres((prev) =>
                prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]
              )}
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

      <p className="text-xs text-text-muted">
        创建后会自动跳转到编辑页面，继续填写游戏介绍、玩法、出招表等内容。
      </p>
    </form>
  )
}
