import "server-only"

import { cache } from "react"
import { sanityClient } from "@/lib/sanity-client"

export interface ServiceCatalogItem {
  _id: string
  _translationKey?: string
  groupKey: string
  slug: string
  language?: string
  title?: string
  description?: string
  desc?: string
  icon?: unknown
  orderRank?: number
  tags?: string[]
}

type RawServiceCatalogItem = Omit<ServiceCatalogItem, "groupKey" | "desc"> & {
  _translationKey?: string
}

const getAllServiceCatalogItems = cache(async (): Promise<RawServiceCatalogItem[]> => {
  const items = await sanityClient.fetch<RawServiceCatalogItem[]>(
    `*[_type == "service" && defined(slug.current) && !(_id in path("drafts.**"))] | order(orderRank asc, _createdAt asc) {
      _id,
      _translationKey,
      "slug": slug.current,
      language,
      title,
      description,
      icon,
      orderRank,
      "tags": coalesce(tags, [])
    }`,
    {},
    { next: { revalidate: 60, tags: ["service-catalog"] } },
  )

  return Array.isArray(items) ? items : []
})

export const getLocalizedServiceCatalog = cache(async (lang: string): Promise<ServiceCatalogItem[]> => {
  const items = await getAllServiceCatalogItems()
  const groups = new Map<string, RawServiceCatalogItem[]>()

  for (const item of items) {
    const groupKey = item._translationKey || item._id
    const group = groups.get(groupKey) || []
    group.push(item)
    groups.set(groupKey, group)
  }

  return Array.from(groups.entries())
    .map(([groupKey, group]) => {
      const selected =
        group.find((item) => item.language === lang) ||
        group.find((item) => item.language === "en") ||
        group.find((item) => item.language === "vi") ||
        group[0]

      return selected
        ? {
            ...selected,
            groupKey,
            desc: selected.description,
          }
        : null
    })
    .filter((item): item is ServiceCatalogItem => Boolean(item))
    .sort((a, b) => (a.orderRank || 0) - (b.orderRank || 0))
})

export const getProductServiceCategories = cache(async (lang: string) => {
  const services = await getLocalizedServiceCatalog(lang)
  return services.map((service) => ({
    _id: service._id,
    title: service.title,
    orderRank: service.orderRank || 0,
  }))
})

export const getPortfolioServiceCategories = cache(async (lang: string) => {
  const services = await getLocalizedServiceCatalog(lang)
  return services.map((service) => ({
    _id: service.groupKey,
    title: service.title,
    orderRank: service.orderRank || 0,
  }))
})
