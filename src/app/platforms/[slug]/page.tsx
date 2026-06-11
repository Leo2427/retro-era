import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/ui/BackButton"

export default async function PlatformGamesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const platform = await prisma.platform.findUnique({
    where: { slug },
    include: {
      games: {
        include: {
          game: {
            include: {
              platforms: { include: { platform: true } },
              genres: { include: { genre: true } },
            },
          },
        },
      },
    },
  })

  if (!platform) notFound()

  const games = platform.games.map((gp) => gp.game)

  return (
    <div className="flex flex-1 flex-col">
      <section className="container-page py-10 sm:py-12">
        <BackButton />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{platform.name}</h1>
        <p className="mt-1.5 text-sm text-text-muted">{games.length} 款游戏</p>

        {games.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2">
            <p className="text-text-muted">暂无游戏</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {game.genres.slice(0, 2).map((gg) => (
                    <span key={gg.genre.id} className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">{gg.genre.name}</span>
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
