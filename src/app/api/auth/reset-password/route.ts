import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { isTokenExpired } from "@/lib/auth-helpers"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "参数不完整" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "密码至少 6 个字符" },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: "重置链接无效" },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        { success: false, error: "该重置链接已被使用" },
        { status: 400 }
      )
    }

    if (isTokenExpired(resetToken.expires)) {
      return NextResponse.json(
        { success: false, error: "该重置链接已过期，请重新申请" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "密码已重置，请使用新密码登录",
    })
  } catch (error) {
    console.error("密码重置失败:", error)
    return NextResponse.json(
      { success: false, error: "密码重置失败，请稍后重试" },
      { status: 500 }
    )
  }
}
