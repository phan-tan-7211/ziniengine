import "server-only"
import { sanityCdnClient } from "@/lib/sanity-client"

const locales = ["vi", "en", "jp", "kr", "cn"] as const

type SupportedType = "service" | "product" | "project" | "blogPost"

export async function getStaticDetailParams(type: SupportedType) {
  const slugs = await sanityCdnClient.fetch<string[]>(
    `array::unique(*[_type == $type && defined(slug.current) && !(_id in path("drafts.**"))].slug.current)`,
    { type },
  )

  const safeSlugs = Array.isArray(slugs) ? slugs.filter((slug): slug is string => typeof slug === "string" && slug.length > 0) : []

  return locales.flatMap((lang) => safeSlugs.map((slug) => ({ lang, slug })))
}
