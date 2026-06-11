import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ success: false, error: "无权限" }, { status: 403 })
  }

  try {
    const { title, content, qrCodeUrl } = await request.json()

    await prisma.pageContent.update({
      where: { slug: "about" },
      data: {
        title: title || "关于 RetroEra",
        content: content || null,
        qrCodeUrl: qrCodeUrl || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("更新关于页面失败:", error)
    return NextResponse.json({ success: false, error: "更新失败" }, { status: 500 })
  }
}
