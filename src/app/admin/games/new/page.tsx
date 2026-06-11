import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NewGameForm } from "./NewGameForm"

export default async function NewGamePage() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "editor" && session.user.role !== "super_admin")) {
    redirect("/login")
  }

  const [platforms, genres] = await Promise.all([
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="p-6 sm:p-8">
      <NewGameForm allPlatforms={platforms} allGenres={genres} />
    </div>
  )
}
