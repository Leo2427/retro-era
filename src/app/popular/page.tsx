import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function PopularPage() {
  const games = await prisma.game.findMany({
    where: { popular: true },
    include: { platforms: { include: { platform: true } }, genres: { include: { genre: true } } },
    orderBy: { title: "asc" },
  })

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
                <p className="truncate text-xs font-medium text-text sm:text-sm">
                  {game.title}{game.titleEn ? " / " + game.titleEn : ""}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {game.platforms.slice(0, 2).map((gp: any) => (
                    <span key={gp.platform.id} className="rounded bg-border/50 px-1.5 py-0.5 text-[10px] text-text-muted">{gp.platform.name}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
