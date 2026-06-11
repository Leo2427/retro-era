"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  userId: string
  currentRole: string
  banned: boolean
  isSelf: boolean
}

export function UserTable({ userId, currentRole, banned, isSelf }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState("")
  const [newPassword, setNewPassword] = useState("")

  async function doAction(action: string) {
    const confirmMsg: Record<string, string> = {
      ban: banned ? "解封" : "封禁",
      promote: "提升为管理员",
      demote: "降级为普通用户",
      "reset-password": "重置此用户的密码？",
    }

    if (!confirm(`确认${confirmMsg[action]}此用户？`)) return

    setLoading(action)
    setNewPassword("")

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()

      if (data.success) {
        if (action === "reset-password") {
          setNewPassword(data.newPassword)
        } else {
          router.refresh()
        }
      } else {
        alert(data.error || "操作失败")
      }
    } catch {
      alert("操作失败")
    } finally {
      setLoading("")
    }
  }

  // 显示新密码（仅一次，关闭后不再显示）
  if (newPassword) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-amber-600">新密码：</span>
        <code
          className="select-all rounded bg-amber-50 px-2 py-0.5 font-mono text-sm text-amber-800"
        >
          {newPassword}
        </code>
        <span className="text-[10px] text-text-muted">点击上方文字即可选中复制</span>
      </div>
    )
  }

  if (isSelf) return <span className="text-xs text-text-muted">当前账号</span>

  return (
    <div className="flex items-center gap-2">
      {currentRole === "user" && (
        <button
          onClick={() => doAction("promote")}
          disabled={loading === "promote"}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          {loading === "promote" ? "..." : "提升管理员"}
        </button>
      )}
      {currentRole === "admin" && (
        <button
          onClick={() => doAction("demote")}
          disabled={loading === "demote"}
          className="text-xs text-orange-600 hover:underline disabled:opacity-50"
        >
          {loading === "demote" ? "..." : "取消管理"}
        </button>
      )}
      <button
        onClick={() => doAction("ban")}
        disabled={loading === "ban"}
        className={`text-xs hover:underline disabled:opacity-50 ${
          banned ? "text-green-600" : "text-red-600"
        }`}
      >
        {loading === "ban" ? "..." : banned ? "解封" : "封禁"}
      </button>
      <button
        onClick={() => doAction("reset-password")}
        disabled={loading === "reset-password"}
        className="text-xs text-amber-600 hover:underline disabled:opacity-50"
      >
        {loading === "reset-password" ? "..." : "重置密码"}
      </button>
    </div>
  )
}
