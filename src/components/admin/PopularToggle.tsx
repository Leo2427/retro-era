"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function PopularToggle({ gameId, popular }: { gameId: string; popular: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    try {
      await fetch("/api/admin/games/" + gameId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ popular: !popular }),
      })
      router.refresh()
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={"text-xs transition-colors " + (popular ? "text-orange-500 hover:text-orange-600" : "text-text-muted hover:text-orange-400")}
    >
      {loading ? "..." : popular ? "🔥 热门" : "标热门"}
    </button>
  )
}
