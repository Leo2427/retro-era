import Link from "next/link"
import { SignOutButton } from "@/components/auth/SignOutButton"
import { RoleBadge } from "@/components/admin/RoleBadge"
import { TodoNavItem } from "@/components/ui/TodoNavItem"

interface HeaderProps {
  userId?: string
  userName?: string
  userRole?: string
  userAvatar?: string | null
}

export function Header({ userId, userName, userRole, userAvatar }: HeaderProps) {
  const canManage = userRole === "admin" || userRole === "super_admin"

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-sm">
      <div className="container-page flex h-20 items-center justify-between">
        <nav className="flex items-center gap-6" aria-label="主导航">
          {[
            { label: "首页", href: "/" },
            { label: "游戏库", href: "/games" },
            { label: "平台", href: "/platforms" },
            { label: "游戏ROMs", todo: true },
            { label: "AI游戏", todo: true },
            { label: "留言板", href: "/messages" },
            { label: "关于", href: "/about" },
            ...(canManage ? [{ label: "管理", href: "/admin" }] : []),
          ].map((item) =>
            "todo" in item ? (
              <TodoNavItem key={item.label} label={item.label} />
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className={`text-sm transition-colors hover:text-text/70 ${
                  item.label === "管理" ? "font-medium text-blue-600" : "text-text"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          {userId ? (
            <div className="flex items-center gap-4">


              <Link href="/profile" className="flex items-center gap-3 group">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="h-[68px] w-[68px] rounded-full border-2 border-border object-cover shrink-0" />
                ) : (
                  <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-border text-sm text-text shrink-0">
                    {userName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm text-text leading-tight">
                    {userName || userId}
                  </span>
                  {userRole && <RoleBadge role={userRole} />}
                </div>
              </Link>

              <SignOutButton />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-text transition-colors hover:text-text/70"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-1.5 text-sm text-white transition-colors hover:bg-accent-hover"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
