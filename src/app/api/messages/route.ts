import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      include: { author: { select: { id: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    console.error("获取留言失败:", error)
    return NextResponse.json({ success: false, error: "获取失败" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 })
  }

  try {
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: "内容不能为空" }, { status: 400 })
    }
    if (content.length > 500) {
      return NextResponse.json({ success: false, error: "内容不能超过500字" }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
      },
      include: { author: { select: { id: true, username: true } } },
    })

    return NextResponse.json({ success: true, data: message })
  } catch (error) {
    console.error("发布留言失败:", error)
    return NextResponse.json({ success: false, error: "发布失败" }, { status: 500 })
  }
}
