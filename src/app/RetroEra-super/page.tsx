"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [email] = useState("creator@retroera.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        loginType: "super_admin",
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "密码错误" : result.error)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch {
      setError("登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
            ⚡
          </div>
          <h1 className="text-xl font-bold">超级管理员</h1>
          <p className="mt-1 text-sm text-text-muted">超级管理员专用登录入口</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm text-accent">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-text">账号</label>
            <input
              value={email}
              readOnly
              className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-amber-400"
            />
            <p className="mt-1 text-xs text-text-muted">内置超级管理员账号</p>
          </div>

          <div>
            <label className="text-sm font-medium text-text">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-amber-400"
              placeholder="输入超级管理员密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录管理后台"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          普通用户请使用
          <a href="/login" className="ml-1 text-accent hover:underline">前台登录</a>
        </p>
      </div>
    </div>
  )
}
