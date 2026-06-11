import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateResetToken, getResetUrl } from "@/lib/auth-helpers"
import { sendResetPasswordEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: "请输入邮箱地址" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      await prisma.passwordResetToken.updateMany({
        where: { email, used: false, expires: { gt: new Date() } },
        data: { expires: new Date(0) },
      })

      const token = generateResetToken()
      const expires = new Date(Date.now() + 60 * 60 * 1000)

      await prisma.passwordResetToken.create({
        data: { email, token, expires },
      })

      const resetUrl = getResetUrl(token)
      await sendResetPasswordEmail(email, resetUrl)
    }

    return NextResponse.json({
      success: true,
      message: "如果该邮箱已注册，重置密码链接已发送",
    })
  } catch (error) {
    console.error("忘记密码请求失败:", error)
    return NextResponse.json({ success: false, error: "请求失败" }, { status: 500 })
  }
}
