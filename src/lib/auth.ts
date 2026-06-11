import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
        loginType: { label: "登录类型", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string
        const loginType = (credentials.loginType as string) || "normal"

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) {
          return null
        }

        // 超级管理员只能从专属登录入口登录
        if (user.role === "super_admin" && loginType !== "super_admin") {
          throw new Error("请使用超级管理员专用登录入口")
        }

        // 普通用户不能从超级管理员入口登录
        if (user.role !== "super_admin" && loginType === "super_admin") {
          throw new Error("此入口仅限超级管理员使用")
        }

        if (user.banned) {
          throw new Error("账号已被封禁")
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
          image: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role: string }).role
        token.id = user.id
        token.picture = user.image
      }
      // 当 session 更新时（如更新资料后），同步最新的 image
      if (trigger === "update" && session) {
        token.picture = (session as { image?: string }).image ?? token.picture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.image = token.picture as string | null | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
  },
})
