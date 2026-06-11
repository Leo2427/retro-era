import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function PopularPage() {
  // 使用原始 SQL 查询热门游戏，避免 Prisma 类型问题
  const games = await prisma.$queryRawUnsafe<Array<{
    id: string; title: string; slug: string; developer: string | null;
    releaseYear: number | null; coverImageUrl: string | null
  }>>(
    "SELECT id, title, slug, developer, \"releaseYear\", \"coverImageUrl\" FROM \"Game\" WHERE popular = true ORDER BY title ASC"
  )

  return (
    <div className="flex flex-1 flex-col">
      <section className="container-page py-10 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">🔥 热门游戏</h1>
        <p className="mt-1.5 text-sm text-text-muted">共 {games.length} 款</p>

        {games.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2">
            <p className="text-text-muted">暂无热门游戏</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 lg:gap-5">
            {games.map(game => (
              <Link key={game.id} href={"/games/" + game.slug} className="group rounded-lg border border-border bg-surface p-2 transition-colors hover:border-text-muted/30 sm:p-3">
                <div className="mb-2 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-border to-bg">
                  {game.coverImageUrl ? (
                    <img src={game.coverImageUrl} alt={game.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-2 text-center text-xs text-text-muted">{game.title}</span>
                  )}
                </div>
                <p className="truncate text-xs font-medium text-text sm:text-sm">{game.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
