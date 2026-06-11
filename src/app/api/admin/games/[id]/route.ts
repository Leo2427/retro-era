import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function checkAuth() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "editor" && session.user.role !== "super_admin")) {
    return false
  }
  return true
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, error: "无权限" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { title, titleEn, developer, publisher, releaseYear, description, gameplayText, storyText, coverImageUrl, platforms, genres, moves } = body

    await prisma.game.update({
      where: { id },
      data: { title, titleEn: titleEn || null, developer, publisher, releaseYear, description, gameplayText, storyText, coverImageUrl },
    })

    if (platforms) {
      await prisma.gamePlatform.deleteMany({ where: { gameId: id } })
      for (const platformId of platforms) {
        await prisma.gamePlatform.create({ data: { gameId: id, platformId } })
      }
    }

    if (genres) {
      await prisma.gameGenre.deleteMany({ where: { gameId: id } })
      for (const genreId of genres) {
        await prisma.gameGenre.create({ data: { gameId: id, genreId } })
      }
    }

    if (moves) {
      await prisma.moveList.deleteMany({ where: { gameId: id } })
      if (moves.length > 0) {
        await prisma.moveList.createMany({
          data: moves.map((m: { character?: string; category: string; command: string; name?: string; description?: string; damage?: string; order?: number }, i: number) => ({
            gameId: id,
            character: m.character || null,
            category: m.category,
            command: m.command,
            name: m.name || null,
            description: m.description || null,
            damage: m.damage || null,
            order: m.order ?? i,
          })),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("更新游戏失败:", error)
    const msg = error instanceof Error ? error.message : "更新失败"
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, error: "无权限" }, { status: 403 })
  }

  try {
    const { id } = await params
    await prisma.game.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除游戏失败:", error)
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 })
  }
}
