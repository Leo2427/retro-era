"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ImageUploader } from "@/components/admin/ImageUploader"

interface Props {
  userId: string
  username: string
  avatarUrl: string
}

export function ProfileForm({ userId, username, avatarUrl }: Props) {
  const router = useRouter()
  const { update } = useSession()
  const [name, setName] = useState(username)
  const [avatar, setAvatar] = useState(avatarUrl)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, avatarUrl: avatar }),
      })
      const data = await res.json()

      if (data.success) {
        setMessage("保存成功 ✓")
        // 刷新 JWT session 使新头像立即生效
        await update({ image: avatar })
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUploader
        currentUrl={avatar}
        type="avatar"
        onUploaded={setAvatar}
        label="头像"
      />

      <div>
        <label className="text-sm font-medium text-text">用户名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-text-muted"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("成功") ? "text-green-600" : "text-accent"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "保存中..." : "保存修改"}
      </button>
    </form>
  )
}
