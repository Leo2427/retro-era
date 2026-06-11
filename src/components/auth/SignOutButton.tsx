"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm("确认退出登录？")) return
        await signOut({ redirect: false })
        window.location.reload()
      }}
      className="text-sm text-red-500 transition-colors hover:text-red-600"
    >
      退出
    </button>
  )
}
