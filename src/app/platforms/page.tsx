import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function PlatformsPage() {
  const platforms = await prisma.platform.findMany({
    include: { games: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-1 flex-col">
      <section className="container-page py-10 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">平台</h1>
        <p className="mt-1.5 text-sm text-text-muted">共 {platforms.length} 个平台</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              href={`/platforms/${platform.slug}`}
              className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-text-muted/30"
            >
              <h2 className="text-lg font-semibold text-text transition-colors group-hover:text-accent">
                {platform.name}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {platform.games.length} 款游戏
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
