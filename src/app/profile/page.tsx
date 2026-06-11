import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./ProfileForm"
import { RoleBadge } from "@/components/admin/RoleBadge"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, email: true, role: true, avatarUrl: true, createdAt: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold">个人资料</h1>

        <div className="mt-6 space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-border to-bg text-xl text-text-muted">
                {user.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-text">
                    {user.username || "未设置"}
                  </span>
                  {user.role && <RoleBadge role={user.role} />}
                </div>
                <p className="mt-0.5 text-sm text-text-muted">{user.email}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  注册于 {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold">编辑资料</h2>
            <ProfileForm
              userId={user.id}
              username={user.username || ""}
              avatarUrl={user.avatarUrl || ""}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
