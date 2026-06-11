import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 })
  }

  try {
    const { username, avatarUrl } = await request.json()

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ success: false, error: "用户名不能为空" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { username },
    })
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ success: false, error: "该用户名已被使用" }, { status: 409 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        avatarUrl: avatarUrl || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("更新资料失败:", error)
    return NextResponse.json({ success: false, error: "更新失败" }, { status: 500 })
  }
}
