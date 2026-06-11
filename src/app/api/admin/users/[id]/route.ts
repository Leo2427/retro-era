import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ success: false, error: "无权限" }, { status: 403 })
  }

  try {
    const { id } = await params
    const { action } = await request.json()

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 })
    }

    // 超级管理员不可被操作
    if (targetUser.role === "super_admin") {
      return NextResponse.json({ success: false, error: "无法操作超级管理员" }, { status: 400 })
    }

    switch (action) {
      case "promote": {
        await prisma.user.update({
          where: { id },
          data: { role: "admin" },
        })
        return NextResponse.json({ success: true })
      }

      case "demote": {
        await prisma.user.update({
          where: { id },
          data: { role: "user" },
        })
        return NextResponse.json({ success: true })
      }

      case "ban": {
        await prisma.user.update({
          where: { id },
          data: { banned: !targetUser.banned },
        })
        return NextResponse.json({
          success: true,
          nowBanned: !targetUser.banned,
        })
      }

      case "reset-password": {
        const newPassword = crypto.randomBytes(8).toString("hex")
        const hashed = await bcrypt.hash(newPassword, 12)
        await prisma.user.update({
          where: { id },
          data: { password: hashed },
        })
        return NextResponse.json({
          success: true,
          newPassword,
        })
      }

      default:
        return NextResponse.json({ success: false, error: "未知操作" }, { status: 400 })
    }
  } catch (error) {
    console.error("用户操作失败:", error)
    return NextResponse.json({ success: false, error: "操作失败" }, { status: 500 })
  }
}
