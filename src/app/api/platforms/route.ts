import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ success: true, data: platforms })
  } catch (error) {
    console.error("Failed to fetch platforms:", error)
    return NextResponse.json(
      { success: false, error: "获取平台列表失败" },
      { status: 500 }
    )
  }
}
