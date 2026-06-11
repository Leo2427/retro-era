"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
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
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "邮箱或密码错误" : result.error)
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("登录失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold">登录</h1>
        <p className="mt-1 text-center text-sm text-text-muted">
          欢迎回到 RetroEra
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

          <div>
            <label htmlFor="password" className="text-sm font-medium text-text">
              密码
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-text-muted"
              placeholder="输入密码"
            />
            <div className="mt-1 text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-text-muted hover:text-accent hover:underline"
              >
                忘记密码？
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          还没有账号？
          <Link href="/register" className="ml-1 text-accent hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  )
}
