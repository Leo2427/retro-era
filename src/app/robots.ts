import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://retro-era.xyz"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/RetroEra-super"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
