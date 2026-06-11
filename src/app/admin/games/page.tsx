import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PopularToggle } from "@/components/admin/PopularToggle"

export default async function AdminGamesPage() {
  const games = await prisma.game.findMany({
    include: {
      platforms: { include: { platform: true } },
      genres: { include: { genre: true } },
      moveLists: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">游戏管理</h1>
          <p className="mt-1 text-sm text-text-muted">共 {games.length} 款游戏</p>
        </div>
        <Link
          href="/admin/games/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover"
        >
          + 新建游戏
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-bg text-xs text-text-muted">
              <th className="px-4 py-3 font-medium">游戏名称</th>
              <th className="px-4 py-3 font-medium">年份</th>
              <th className="px-4 py-3 font-medium">平台</th>
              <th className="px-4 py-3 font-medium">招式</th>
              <th className="px-4 py-3 font-medium">热门</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="border-t border-border transition-colors hover:bg-bg/50">
                <td className="px-4 py-3 font-medium text-text">{game.title}</td>
                <td className="px-4 py-3 text-text-muted">{game.releaseYear || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {game.platforms.map((gp) => (
                      <span
                        key={gp.platform.id}
                        className="rounded bg-border/50 px-1.5 py-0.5 text-[11px] text-text-muted"
                      >
                        {gp.platform.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">{game.moveLists.length}</td>
                <td className="px-4 py-3">
                  <PopularToggle gameId={game.id} popular={game.popular} />
                </td>
                <td className="px-4 py-3">
                  <Link href={"/games/" + game.slug + "/edit"} className="text-accent hover:underline">编辑</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
