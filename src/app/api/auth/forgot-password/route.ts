import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateResetToken, getResetUrl } from "@/lib/auth-helpers"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: "请输入邮箱地址" },
        { status: 400 }
      )
    }

    // 无论邮箱是否存在，都返回成功（防止枚举已注册邮箱）
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // 使旧的未使用令牌失效
      await prisma.passwordResetToken.updateMany({
        where: { email, used: false, expires: { gt: new Date() } },
        data: { expires: new Date(0) },
      })

      // 生成新令牌（1小时有效）
      const token = generateResetToken()
      const expires = new Date(Date.now() + 60 * 60 * 1000)

      await prisma.passwordResetToken.create({
        data: { email, token, expires },
      })

      const resetUrl = getResetUrl(token)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

      // 开发环境：打印重置链接到控制台
      if (process.env.NODE_ENV !== "production") {
        console.log("")
        console.log("  ┌──────────────────────────────────────────┐")
        console.log("  │        🔐 密码重置链接                    │")
        console.log(`  │  ${resetUrl.padEnd(40)} │`)
        console.log("  │  有效期：1 小时                           │")
        console.log("  └──────────────────────────────────────────┘")
        console.log("")
      }

      // TODO: 生产环境接入邮件服务（Resend / SendGrid 等）
      // await sendResetEmail({ email, resetUrl })
    }

    return NextResponse.json({
      success: true,
      message: "如果该邮箱已注册，重置密码链接已发送",
    })
  } catch (error) {
    console.error("忘记密码请求失败:", error)
    return NextResponse.json(
      { success: false, error: "请求失败，请稍后重试" },
      { status: 500 }
    )
  }
}
