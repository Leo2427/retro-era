"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("两次密码输入不一致")
      return
    }

    setLoading(true)

    try {
      const { token } = await params
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "重置失败")
        return
      }

      setDone(true)
    } catch {
      setError("重置失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
            ✓
          </div>
          <h1 className="text-xl font-bold">密码已重置</h1>
          <p className="mt-3 text-sm text-text-muted">
            请使用新密码登录。
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-accent px-6 py-2.5 text-sm text-white transition-colors hover:bg-accent-hover"
          >
            去登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold">设置新密码</h1>
        <p className="mt-1 text-center text-sm text-text-muted">
          请输入新密码
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm text-accent">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="text-sm font-medium text-text">
              新密码
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-text-muted"
              placeholder="至少 6 位密码"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="text-sm font-medium text-text">
              确认新密码
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-text-muted"
              placeholder="再次输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "重置中..." : "重置密码"}
          </button>
        </form>
      </div>
    </div>
  )
}
