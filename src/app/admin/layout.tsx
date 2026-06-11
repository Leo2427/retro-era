import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { RoleBadge } from "@/components/admin/RoleBadge"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "admin" && session.user.role !== "super_admin") {
    redirect("/")
  }

  const canManageUsers = session.user.role === "super_admin"

  return (
    <div className="flex flex-1">
      {/* 侧边栏 */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface sm:block">
        <div className="flex h-full flex-col gap-1 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Link href="/admin" className="text-sm font-semibold text-text">
              管理后台
            </Link>
            {session.user.role && <RoleBadge role={session.user.role} />}
          </div>

          <Link
            href="/admin"
            className="rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 hover:text-text"
          >
            📋 概览
          </Link>

          <Link
            href="/admin/games"
            className="rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 hover:text-text"
          >
            🎮 游戏管理
          </Link>

          {canManageUsers && (
            <Link
              href="/admin/users"
              className="rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 hover:text-text"
            >
              👥 人员管理
            </Link>
          )}

          {session.user.role === "super_admin" && (
            <Link
              href="/admin/about"
              className="rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 hover:text-text"
            >
              📄 关于页面
            </Link>
          )}

          <div className="mt-auto pt-4">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 hover:text-text"
            >
              🏠 返回前台
            </Link>
          </div>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
