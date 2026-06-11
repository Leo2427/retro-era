import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

async function getRecentGames() {
  return prisma.game.findMany({
    include: { platforms: { include: { platform: true } }, genres: { include: { genre: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  })
}

async function getPopularGames() {
  return prisma.game.findMany({
    where: { popular: true },
    include: { platforms: { include: { platform: true } }, genres: { include: { genre: true } } },
    take: 12,
  })
}

function GameCard({ game }: { game: any }) {
  return (
    <Link href={"/games/" + game.slug} className="group rounded-lg border border-border bg-surface p-2 transition-colors hover:border-text-muted/30 sm:p-2.5">
      <div className="mb-1.5 flex aspect-[4/5] items-center justify-center overflow-hidden rounded bg-gradient-to-b from-border to-bg">
        {game.coverImageUrl ? (
          <img src={game.coverImageUrl} alt={game.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="px-1 text-center text-[10px] text-text-muted">{game.title}</span>
        )}
      </div>
      <p className="truncate text-[11px] font-medium leading-tight text-text transition-colors group-hover:text-accent sm:text-xs">
        {game.title}{game.titleEn ? " / " + game.titleEn : ""}
      </p>
      <div className="mt-1 flex flex-wrap gap-1">
        {game.platforms.slice(0, 1).map((gp: any) => (
          <span key={gp.platform.id} className="rounded bg-border/50 px-1.5 py-0.5 text-[9px] text-text-muted">{gp.platform.name}</span>
        ))}
        {game.genres.slice(0, 1).map((gg: any) => (
          <span key={gg.genre.id} className="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] text-accent">{gg.genre.name}</span>
        ))}
      </div>
    </Link>
  )
}

export default async function Home() {
  const [recentGames, popularGames] = await Promise.all([getRecentGames(), getPopularGames()])

  return (
    <div className="flex flex-1 flex-col">
      {/* 顶部标识 */}
      <section className="container-page flex items-center justify-between py-8 sm:py-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <Image src="/images/logo.png" alt="RetroEra" width={120} height={120} className="h-20 w-auto sm:h-32" priority />
          <p className="bg-gradient-to-r from-orange-500 via-red-600 to-red-800 bg-clip-text text-sm font-semibold text-transparent sm:text-base">怀旧时光 · 经典永存</p>
        </div>
        <Link href="/about" className="text-xs text-accent-alt transition-colors hover:brightness-110 sm:text-sm">用爱发电 · 随缘支持 →</Link>
      </section>

      {/* 最近添加 */}
      <section className="container-page mb-10 sm:mb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold sm:text-lg">最近添加</h2>
          <Link href="/games" className="rounded-full bg-accent px-4 py-1.5 text-sm text-white transition-colors hover:bg-accent-hover">查看全部 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6 lg:gap-4">
          {recentGames.map(game => <GameCard key={game.id} game={game} />)}
        </div>
      </section>

      {/* 热门游戏 */}
      {popularGames.length > 0 && (
        <section className="container-page section-gap">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold sm:text-lg">🔥 热门游戏</h2>
            <Link href="/popular" className="rounded-full bg-accent px-4 py-1.5 text-sm text-white transition-colors hover:bg-accent-hover">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6 lg:gap-4">
            {popularGames.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        </section>
      )}
    </div>
  )
}
