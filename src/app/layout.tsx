import type { Metadata } from "next"
import { Inter, Noto_Sans_SC, JetBrains_Mono } from "next/font/google"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { SessionProvider } from "@/components/auth/SessionProvider"
import { auth } from "@/lib/auth"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "RetroEra — 怀旧时光 · 经典永存",
    template: "%s — RetroEra",
  },
  description: "复古游戏信息数据库 — 游戏介绍、玩法、出招表，重温经典时光。",
  icons: [{ rel: "icon", url: "/favicon.png", sizes: "128x128" }],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${notoSansSC.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SessionProvider>
          <Header
            userId={session?.user?.id ?? undefined}
            userName={session?.user?.name ?? undefined}
            userRole={session?.user?.role ?? undefined}
            userAvatar={session?.user?.image ?? undefined}
          />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
