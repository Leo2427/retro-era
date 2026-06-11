import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json({ success: true, data: genres })
  } catch {
    return NextResponse.json({ success: false, error: "获取失败" }, { status: 500 })
  }
}
