import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { GameEditForm } from "./GameEditForm"

async function getGame(slug: string) {
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      platforms: { include: { platform: true } },
      genres: { include: { genre: true } },
      moveLists: { orderBy: [{ character: "asc" }, { order: "asc" }] },
    },
  })
  return game
}

export default async function GameEditPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "editor" && session.user.role !== "super_admin")) {
    redirect("/login")
  }

  const { slug } = await params
  const game = await getGame(slug)
  if (!game) notFound()

  const [platforms, genres] = await Promise.all([
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="p-6 sm:p-8">
      <GameEditForm game={game} allPlatforms={platforms} allGenres={genres} />
    </div>
  )
}
