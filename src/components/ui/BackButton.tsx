"use client"

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text"
    >
      ← 返回
    </button>
  )
}
