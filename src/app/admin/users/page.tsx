import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { UserTable } from "./UserTable"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "super_admin") {
    redirect("/admin")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
    },
  })

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">人员管理</h1>
          <p className="mt-1 text-sm text-text-muted">共 {users.length} 位用户</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-bg text-xs text-text-muted">
              <th className="px-4 py-3 font-medium">用户名</th>
              <th className="px-4 py-3 font-medium">邮箱</th>
              <th className="px-4 py-3 font-medium">角色</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">注册时间</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-border transition-colors hover:bg-bg/50"
              >
                <td className="px-4 py-3 font-medium text-text">
                  {user.username || "-"}
                </td>
                <td className="px-4 py-3 text-text-muted">{user.email || "-"}</td>
                <td className="px-4 py-3">
                  {user.role === "super_admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      ⚡ 超级管理员
                    </span>
                  ) : user.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                      ◆ 管理员
                    </span>
                  ) : (
                    <span className="text-text-muted">普通用户</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.banned ? (
                    <span className="text-red-500">封禁</span>
                  ) : (
                    <span className="text-green-600">正常</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3">
                  <UserTable
                    userId={user.id}
                    currentRole={user.role}
                    banned={user.banned}
                    isSelf={user.id === session.user?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
