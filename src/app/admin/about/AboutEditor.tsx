"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ImageUploader } from "@/components/admin/ImageUploader"
import Link from "next/link"

interface Props {
  title: string
  content: string
  qrCodeUrl: string
}

export function AboutEditor({ title, content, qrCodeUrl }: Props) {
  const router = useRouter()
  const [formTitle, setFormTitle] = useState(title)
  const [formContent, setFormContent] = useState(content)
  const [formQr, setFormQr] = useState(qrCodeUrl)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle, content: formContent, qrCodeUrl: formQr }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage("保存成功 ✓")
        router.refresh()
      } else {
        setMessage(data.error || "保存失败")
      }
    } catch {
      setMessage("保存失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">编辑关于页面</h1>
        <div className="flex gap-3">
          <Link
            href="/about"
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:bg-border/50"
          >
            预览
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg border px-4 py-2.5 text-sm ${message.includes("成功") ? "border-green-300 bg-green-50 text-green-700" : "border-accent/30 bg-accent/5 text-accent"}`}>
          {message}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-text">页面标题</label>
        <input
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-text-muted"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-text">页面内容</label>
        <p className="mb-1 text-xs text-text-muted">用空行分隔段落</p>
        <textarea
          rows={12}
          value={formContent}
          onChange={(e) => setFormContent(e.target.value)}
          className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-text-muted"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-text">微信收款码</label>
        <p className="mb-2 text-xs text-text-muted">上传后访客在关于页面可见</p>
        <ImageUploader
          currentUrl={formQr}
          type="avatar"
          onUploaded={setFormQr}
        />
      </div>
    </form>
  )
}
