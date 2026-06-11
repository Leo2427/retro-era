"use client"

import { useState, useRef } from "react"

interface Props {
  currentUrl?: string | null
  type: "avatar" | "cover"
  slug?: string
  onUploaded: (url: string) => void
  label?: string
}

export function ImageUploader({ currentUrl, type, slug, onUploaded, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      if (slug) formData.append("slug", slug)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        onUploaded(data.url)
      } else {
        setError(data.error || "上传失败")
        setPreview(null)
      }
    } catch {
      setError("上传失败")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const displayUrl = preview || currentUrl

  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-text">{label}</p>}

      <div
        onClick={() => inputRef.current?.click()}
        className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-bg/50 p-4 transition-colors hover:border-text-muted/30"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="预览"
            className={`max-h-48 rounded object-contain ${
              preview ? "opacity-60" : ""
            }`}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 py-8">
            <span className="text-2xl text-text-muted">📁</span>
            <span className="text-sm text-text-muted">
              {uploading ? "上传中..." : "点击选择图片"}
            </span>
            <span className="text-xs text-text-muted/60">
              JPG / PNG / WebP，最大 5MB
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/60">
            <span className="text-sm text-text-muted">上传中...</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}

      {currentUrl && !preview && (
        <p className="mt-1 text-xs text-text-muted">点击上方重新上传</p>
      )}
    </div>
  )
}
