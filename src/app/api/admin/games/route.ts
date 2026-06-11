import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "editor" && session.user.role !== "super_admin")) {
    return NextResponse.json({ success: false, error: "无权限" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, titleEn, slug, developer, publisher, releaseYear, platforms, genres } = body

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: "游戏名称和URL标识为必填项" }, { status: 400 })
    }

    const existing = await prisma.game.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ success: false, error: "该URL标识已被使用，请修改游戏名称" }, { status: 409 })
    }

    const game = await prisma.game.create({
      data: {
        title,
        titleEn: titleEn || null,
        slug,
        developer: developer || null,
        publisher: publisher || null,
        releaseYear: releaseYear || null,
      },
    })

    if (platforms?.length) {
      for (const platformId of platforms) {
        await prisma.gamePlatform.create({ data: { gameId: game.id, platformId } })
      }
    }

    if (genres?.length) {
      for (const genreId of genres) {
        await prisma.gameGenre.create({ data: { gameId: game.id, genreId } })
      }
    }

    return NextResponse.json({ success: true, data: { id: game.id, slug: game.slug } })
  } catch (error) {
    console.error("创建游戏失败:", error)
    return NextResponse.json({ success: false, error: "创建失败" }, { status: 500 })
  }
}
