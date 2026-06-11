import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AboutPage() {
  const page = await prisma.pageContent.findUnique({ where: { slug: "about" } })

  const paragraphs = page?.content?.split("\n\n").filter(Boolean) || []

  return (
    <div className="flex flex-1 flex-col">
      <section className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-prose">
          <h1 className="text-2xl font-bold sm:text-3xl">{page?.title || "关于"}</h1>

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-text-muted sm:text-base">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {page?.qrCodeUrl && (
            <div className="mt-10">
              <p className="mb-3 text-sm text-text-muted">扫码支持站长</p>
              <img
                src={page.qrCodeUrl}
                alt="微信收款码"
                className="h-60 w-60 rounded-lg border border-border object-cover"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
