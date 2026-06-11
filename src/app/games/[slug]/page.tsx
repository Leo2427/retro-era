import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/ui/BackButton"

async function getGame(slug: string) {
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      platforms: { include: { platform: true } },
      genres: { include: { genre: true } },
      moveLists: { orderBy: [{ character: "asc" }, { order: "asc" }] },
    },
  })
  return game
}

// 按角色分组出招表
function groupMovesByCharacter(
  moves: { character: string | null; category: string; command: string; name: string | null; description: string | null; damage: string | null; order: number }[]
) {
  const groups: Record<string, typeof moves> = {}
  for (const move of moves) {
    const key = move.character || "通用"
    if (!groups[key]) groups[key] = []
    groups[key].push(move)
  }
  return groups
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const game = await getGame(slug)

  if (!game) {
    notFound()
  }

  const moveGroups = game.moveLists.length > 0 ? groupMovesByCharacter(game.moveLists) : null

  return (
    <div className="flex flex-1 flex-col">
      <section className="container-page py-10 sm:py-12">
        <BackButton />
        {/* 面包屑 */}
        <nav className="mb-6 text-sm text-text-muted">
          <Link href="/" className="hover:text-text">
            首页
          </Link>
          <span className="mx-2">/</span>
          <Link href="/games" className="hover:text-text">
            游戏库
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text">{game.title}</span>
        </nav>

        {/* 基本信息 */}
        <div className="flex flex-col gap-8 sm:flex-row">
          <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-border to-bg sm:w-72">
            {game.coverImageUrl ? (
              <img src={game.coverImageUrl} alt={game.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm text-text-muted">{game.title}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">{game.title}</h1>
            {game.titleEn && (
              <p className="mt-1 text-sm text-text-muted">{game.titleEn}</p>
            )}

            <div className="mt-4 space-y-2 text-sm text-text-muted">
              {game.developer && (
                <p>
                  <span className="font-medium text-text">开发商：</span>
                  {game.developer}
                </p>
              )}
              {game.publisher && (
                <p>
                  <span className="font-medium text-text">发行商：</span>
                  {game.publisher}
                </p>
              )}
              {game.releaseYear && (
                <p>
                  <span className="font-medium text-text">发行年份：</span>
                  {game.releaseYear}
                </p>
              )}
            </div>

            {/* 平台/类型标签 */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-medium text-text">平台：</span>
                {game.platforms.map((gp) => (
                  <span
                    key={gp.platform.id}
                    className="rounded bg-border/50 px-2 py-0.5 text-xs text-text-muted"
                  >
                    {gp.platform.name}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-medium text-text">类型：</span>
                {game.genres.map((gg) => (
                  <span
                    key={gg.genre.id}
                    className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent"
                  >
                    {gg.genre.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 游戏介绍 */}
        {game.description && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold sm:text-xl">游戏介绍</h2>
            <p className="mt-3 leading-relaxed text-text-muted">
              {game.description}
            </p>
          </section>
        )}

        {/* 故事背景 */}
        {game.storyText && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold sm:text-xl">故事背景</h2>
            <p className="mt-3 leading-relaxed text-text-muted">
              {game.storyText}
            </p>
          </section>
        )}

        {/* 玩法概述 */}
        {game.gameplayText && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold sm:text-xl">玩法概述</h2>
            <p className="mt-3 leading-relaxed text-text-muted">
              {game.gameplayText}
            </p>
          </section>
        )}

        {/* 出招表 */}
        {moveGroups && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold sm:text-xl">出招表</h2>
            <div className="mt-4 space-y-6">
              {Object.entries(moveGroups).map(([character, moves]) => (
                <div key={character}>
                  <h3 className="mb-2 text-base font-medium text-text">
                    {character}
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-bg text-xs text-text-muted">
                          <th className="px-4 py-2 font-medium">分类</th>
                          <th className="px-4 py-2 font-medium">招式名称</th>
                          <th className="px-4 py-2 font-medium">指令</th>
                          <th className="px-4 py-2 font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moves.map((move, i) => (
                          <tr
                            key={i}
                            className="border-t border-border transition-colors hover:bg-bg/50"
                          >
                            <td className="whitespace-nowrap px-4 py-2.5 text-text-muted">
                              {move.category}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 font-medium text-text">
                              {move.name || "-"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 font-mono text-sm text-accent">
                              {move.command}
                            </td>
                            <td className="px-4 py-2.5 text-text-muted">
                              {move.description || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  )
}
