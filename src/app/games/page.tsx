"use client"

import { Suspense, useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

interface Platform { id: string; name: string; slug: string }
interface Genre { id: string; name: string; slug: string }

interface Game {
  id: string
  title: string
  titleEn?: string
  slug: string
  developer?: string
  releaseYear?: number
  coverImageUrl?: string
  platforms: Platform[]
  genres: Genre[]
}

function GamesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const composingRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [games, setGames] = useState<Game[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [allPlatforms, setAllPlatforms] = useState<Platform[]>([])
  const [allGenres, setAllGenres] = useState<Genre[]>([])

  const search = searchParams.get("search") || ""
  const platform = searchParams.get("platform") || ""
  const genre = searchParams.get("genre") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 20

  function setParam(key: string, value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      if (key !== "page") params.set("page", "1")
      router.push(`/games?${params.toString()}`)
    }, key === "search" ? 300 : 0)
  }

  function setSearchNow(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set("search", value)
      else params.delete("search")
      params.set("page", "1")
      router.push(`/games?${params.toString()}`)
    }, 300)
  }

  const fetchGames = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set("search", search)
      if (platform) params.set("platform", platform)
      if (genre) params.set("genre", genre)

      const res = await fetch(`/api/games?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setGames(data.data)
        setTotal(data.meta.total)
      }
    } finally {
      setLoading(false)
    }
  }, [search, platform, genre, page])

  useEffect(() => { fetchGames() }, [fetchGames])

  useEffect(() => {
    fetch("/api/platforms").then(r => r.json()).then(d => { if (d.success) setAllPlatforms(d.data) })
    fetch("/api/genres").then(r => r.json()).then(d => { if (d.success) setAllGenres(d.data) })
  }, [])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-1 flex-col">
      <section className="container-page py-10 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">游戏库</h1>
        <p className="mt-1.5 text-sm text-text-muted">共 {total} 款游戏</p>

        {/* 搜索框 */}
        <div className="mt-6">
          <input
            defaultValue={search}
            onCompositionStart={() => { composingRef.current = true }}
            onCompositionEnd={(e) => {
              composingRef.current = false
              setSearchNow((e.target as HTMLInputElement).value)
            }}
            onChange={(e) => {
              if (!composingRef.current) setSearchNow(e.target.value)
            }}
            placeholder="搜索游戏名称..."
            className="block w-full max-w-md rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-text-muted"
          />
        </div>

        {/* 筛选标签 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-text-muted self-center">平台：</span>
          <button
            onClick={() => setParam("platform", "")}
            className={`rounded-lg border px-3 py-1 text-xs transition-colors ${!platform ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-text-muted/30"}`}
          >
            全部
          </button>
          {allPlatforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setParam("platform", platform === p.slug ? "" : p.slug)}
              className={`rounded-lg border px-3 py-1 text-xs transition-colors ${platform === p.slug ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-text-muted/30"}`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-text-muted self-center">类型：</span>
          <button
            onClick={() => setParam("genre", "")}
            className={`rounded-lg border px-3 py-1 text-xs transition-colors ${!genre ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-text-muted/30"}`}
          >
            全部
          </button>
          {allGenres.map((g) => (
            <button
              key={g.id}
              onClick={() => setParam("genre", genre === g.slug ? "" : g.slug)}
              className={`rounded-lg border px-3 py-1 text-xs transition-colors ${genre === g.slug ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-text-muted/30"}`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* 游戏列表 */}
        <div className="mt-8 min-h-[400px]">
          {games.length === 0 && !loading ? (
            <div className="flex flex-col items-center gap-2 pt-16">
              <p className="text-text-muted">没有找到匹配的游戏</p>
              <button onClick={() => router.push("/games")} className="text-sm text-accent hover:underline">
                清除筛选条件
              </button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="group rounded-lg border border-border bg-surface p-3 transition-colors hover:border-text-muted/30 sm:p-4"
                >
                  <div className="mb-3 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-border to-bg">
                    {game.coverImageUrl ? (
                      <img src={game.coverImageUrl} alt={game.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="px-2 text-center text-xs text-text-muted">{game.title}</span>
                    )}
                  </div>
                  <h3 className="truncate text-sm font-medium leading-tight text-text transition-colors group-hover:text-accent sm:text-base">
                    {game.title}{game.titleEn ? ` / ${game.titleEn}` : ""}
                  </h3>
                  {game.releaseYear && (
                    <p className="mt-0.5 text-xs text-text-muted">{game.releaseYear}</p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {game.platforms.slice(0, 2).map((gp) => (
                      <span key={gp.id} className="rounded bg-border/50 px-1.5 py-0.5 text-[10px] text-text-muted">{gp.name}</span>
                    ))}
                    {game.genres.slice(0, 1).map((gg) => (
                      <span key={gg.id} className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">{gg.name}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {/* 分页 — 百度风格 */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1">
                <button
                  onClick={() => setParam("page", String(page - 1))}
                  disabled={page <= 1}
                  className="rounded px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &lt; 上一页
                </button>
                {(() => {
                  var items = []
                  for (var p = 1; p <= totalPages; p++) {
                    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) {
                      if (items.length && p - items[items.length - 1] > 1) items.push(-1)
                      items.push(p)
                    }
                  }
                  return items.map((item, idx) =>
                    item === -1 ? (
                      <span key={"e" + idx} className="px-2 text-sm text-text-muted">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setParam("page", String(item))}
                        className={"min-w-[32px] rounded px-2 py-1.5 text-sm transition-colors " + (item === page ? "bg-accent text-white" : "text-text-muted hover:bg-border/50")}
                      >
                        {item}
                      </button>
                    )
                  )
                })()}
                <button
                  onClick={() => setParam("page", String(page + 1))}
                  disabled={page >= totalPages}
                  className="rounded px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  下一页 &gt;
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </section>
    </div>
  )
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="container-page py-10 text-sm text-text-muted">加载中...</div>}>
      <GamesContent />
    </Suspense>
  )
}


