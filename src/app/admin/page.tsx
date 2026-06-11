import { prisma } from "@/lib/prisma"

export default async function AdminPage() {
  const [gameCount, userCount, moveCount] = await Promise.all([
    prisma.game.count(),
    prisma.user.count(),
    prisma.moveList.count(),
  ])

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold sm:text-2xl">概览</h1>
      <p className="mt-1 text-sm text-text-muted">管理后台首页</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-text-muted">游戏总数</p>
          <p className="mt-1 text-3xl font-bold">{gameCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-text-muted">出招表条目</p>
          <p className="mt-1 text-3xl font-bold">{moveCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-text-muted">注册用户</p>
          <p className="mt-1 text-3xl font-bold">{userCount}</p>
        </div>
      </div>
    </div>
  )
}
