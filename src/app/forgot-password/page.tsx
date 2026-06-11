"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "请求失败")
        return
      }

      setSent(true)
    } catch {
      setError("请求失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-xl text-accent">
            ✉️
          </div>
          <h1 className="text-xl font-bold">邮件已发送</h1>
          <p className="mt-3 text-sm text-text-muted leading-relaxed">
            如果该邮箱已注册，重置密码链接已发送到 <strong className="text-text">{email}</strong>
            <br />
            请检查收件箱（或垃圾邮件），链接 1 小时内有效。
          </p>
          <p className="mt-6 text-xs text-text-muted">
            开发模式下，重置链接会打印在终端控制台中。
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-accent hover:underline"
          >
            返回登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold">忘记密码</h1>
        <p className="mt-1 text-center text-sm text-text-muted">
          输入注册时使用的邮箱，我们将发送重置链接
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm text-accent">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-medium text-text">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-text-muted"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "发送中..." : "发送重置链接"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          想起密码了？
          <Link href="/login" className="ml-1 text-accent hover:underline">
            返回登录
          </Link>
        </p>
      </div>
    </div>
  )
}
