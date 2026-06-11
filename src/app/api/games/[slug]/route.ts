import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        platforms: { include: { platform: true } },
        genres: { include: { genre: true } },
        moveLists: { orderBy: [{ character: "asc" }, { order: "asc" }] },
      },
    })

    if (!game) {
      return NextResponse.json(
        { success: false, error: "游戏不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: game.id,
        title: game.title,
        slug: game.slug,
        developer: game.developer,
        publisher: game.publisher,
        releaseYear: game.releaseYear,
        description: game.description,
        gameplayText: game.gameplayText,
        storyText: game.storyText,
        coverImageUrl: game.coverImageUrl,
        screenshots: game.screenshots,
        platforms: game.platforms.map((gp) => gp.platform),
        genres: game.genres.map((gg) => gg.genre),
        moveLists: game.moveLists,
      },
    })
  } catch (error) {
    console.error("Failed to fetch game:", error)
    return NextResponse.json(
      { success: false, error: "获取游戏详情失败" },
      { status: 500 }
    )
  }
}
