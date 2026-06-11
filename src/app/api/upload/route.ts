import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = (formData.get("type") as string) || "avatar"
    const slug = (formData.get("slug") as string) || ""

    if (!file) {
      return NextResponse.json({ success: false, error: "请选择文件" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "仅支持 JPG、PNG、WebP、GIF 格式" },
        { status: 400 }
      )
    }

    const maxSize = type === "cover" ? 2 * 1024 * 1024 : 500 * 1024
    const sizeLabel = type === "cover" ? "2MB" : "500KB"
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `${type === "cover" ? "封面图" : "头像"}大小不能超过 ${sizeLabel}` },
        { status: 400 }
      )
    }

    const { supabaseAdmin, STORAGE_BUCKETS } = await import("@/lib/supabase")

    const bucket = type === "cover" ? STORAGE_BUCKETS.GAME_COVERS : STORAGE_BUCKETS.AVATARS
    const ext = file.name.split(".").pop() || "webp"
    const fileName = type === "cover"
      ? `${slug}/cover.${ext}`
      : `${session.user.id}/avatar.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error("上传失败:", error)
      return NextResponse.json({ success: false, error: "上传失败: " + error.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path)
    const cacheBuster = type === "avatar" ? `?v=${Date.now()}` : ""

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl + cacheBuster,
    })
  } catch (error) {
    console.error("上传失败:", error)
    return NextResponse.json({ success: false, error: "上传失败" }, { status: 500 })
  }
}
