import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY
const emailFrom = process.env.EMAIL_FROM || "noreply@resend.dev"

let resend: Resend | null = null
if (resendApiKey) {
  resend = new Resend(resendApiKey)
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.log("")
    console.log("  ┌──────────────────────────────────────────┐")
    console.log("  │        🔐 密码重置链接                    │")
    console.log(`  │  ${resetUrl.padEnd(40)} │`)
    console.log("  │  （未配置 RESEND_API_KEY，仅打印到控制台）  │")
    console.log("  └──────────────────────────────────────────┘")
    console.log("")
    return
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to,
      subject: "RetroEra - 密码重置",
      html: `
        <div style="max-width:480px;margin:0 auto;padding:24px;font-family:sans-serif">
          <h2 style="color:#333">密码重置</h2>
          <p style="color:#666;line-height:1.6">
            点击下方链接重置您的 RetroEra 账号密码，链接有效期为 1 小时。
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;margin:16px 0;padding:12px 24px;
                    background:#c73e3e;color:#fff;text-decoration:none;border-radius:6px">
            重置密码
          </a>
          <p style="color:#999;font-size:12px">
            如果按钮无法点击，请复制以下链接到浏览器：<br>
            <span style="color:#666">${resetUrl}</span>
          </p>
        </div>
      `,
    })
    console.log(`✅ 密码重置邮件已发送到 ${to}`)
  } catch (error) {
    console.error("发送邮件失败:", error)
  }
}
