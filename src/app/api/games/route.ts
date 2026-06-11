import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const platform = searchParams.get("platform") || ""
  const genre = searchParams.get("genre") || ""
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))
  const skip = (page - 1) * limit

  try {
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleEn: { contains: search } },
      ]
    }

    if (platform) {
      where.platforms = {
        some: {
          platform: { slug: platform },
        },
      }
    }

    if (genre) {
      where.genres = {
        some: {
          genre: { slug: genre },
        },
      }
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          platforms: {
            include: { platform: true },
          },
          genres: {
            include: { genre: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.game.count({ where }),
    ])

    const formatted = games.map((g) => ({
      id: g.id,
      title: g.title,
      titleEn: g.titleEn,
      slug: g.slug,
      developer: g.developer,
      releaseYear: g.releaseYear,
      coverImageUrl: g.coverImageUrl,
      platforms: g.platforms.map((gp) => gp.platform),
      genres: g.genres.map((gg) => gg.genre),
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Failed to fetch games:", error)
    return NextResponse.json(
      { success: false, error: "获取游戏列表失败" },
      { status: 500 }
    )
  }
}
