import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ success: false, error: "无权限" }, { status: 403 })
  }

  try {
    const { id } = await params
    await prisma.message.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除留言失败:", error)
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 })
  }
}
