"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Message {
  id: string
  content: string
  createdAt: string
  author: { id: string; username: string | null }
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages")
      const data = await res.json()
      if (data.success) setMessages(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setContent("")
        fetchMessages()
      } else {
        setError(data.error || "发布失败")
      }
    } catch {
      setError("发布失败")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除此留言？")) return
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "DELETE" })
      fetchMessages()
    } catch {}
  }

  const isSuperAdmin = session?.user?.role === "super_admin"

  return (
    <div className="flex flex-1 flex-col">
      <section className="container-page py-10 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">留言板</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          注册用户可留言，欢迎分享你的想法
        </p>

        {session?.user ? (
          <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的想法..."
              className="block flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-text-muted resize-none"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="shrink-0 self-end rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {submitting ? "..." : "发布"}
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-bg/50 px-4 py-3 text-sm text-text-muted">
            <a href="/login" className="text-accent hover:underline">登录</a> 后即可留言
          </div>
        )}

        {error && <p className="mt-3 text-sm text-accent">{error}</p>}

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-sm text-text-muted">加载中...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-text-muted">暂无留言，来写下第一条吧</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-border text-[11px] text-text-muted">
                      {msg.author.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-medium text-text">
                      {msg.author.username || "匿名"}
                    </span>
                    <span className="text-xs text-text-muted">
                      {new Date(msg.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-xs text-red-400 hover:text-red-600 hover:underline"
                    >
                      删除
                    </button>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
