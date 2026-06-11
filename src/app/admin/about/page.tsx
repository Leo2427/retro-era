import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AboutEditor } from "./AboutEditor"

export default async function AdminAboutPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "super_admin") {
    redirect("/admin")
  }

  const page = await prisma.pageContent.findUnique({ where: { slug: "about" } })

  return (
    <div className="p-6 sm:p-8">
      <AboutEditor
        title={page?.title || "关于 RetroEra"}
        content={page?.content || ""}
        qrCodeUrl={page?.qrCodeUrl || ""}
      />
    </div>
  )
}
