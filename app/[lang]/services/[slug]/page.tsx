import { notFound } from "next/navigation"
import { cache } from "react"
import { ServicePageContent } from "@/components/service-page-content"
import { getDictionary } from "@/lib/get-dictionary"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { Footer } from "@/components/footer"
import { sanityClient } from "@/lib/sanity-client"
import { getPublicSiteUrl } from "@/lib/runtime-config"

type RawService = Record<string, any>

function normalizeService(service: RawService | null) {
  if (!service) return null

  return {
    ...service,
    _id: typeof service._id === "string" ? service._id : "",
    _translationKey: typeof service._translationKey === "string" ? service._translationKey : undefined,
    icon: service.icon,
    title: typeof service.title === "string" ? service.title : "Dịch vụ",
    shortTitle: typeof service.shortTitle === "string" ? service.shortTitle : undefined,
    slug: typeof service.slug === "string" ? service.slug : "",
    description: typeof service.description === "string" ? service.description : "",
    image: typeof service.image === "string" ? service.image : undefined,
    tags: Array.isArray(service.tags) ? service.tags.filter((item: unknown) => typeof item === "string") : [],
    features: Array.isArray(service.features) ? service.features.filter((item: unknown) => typeof item === "string") : [],
    specs: Array.isArray(service.specs)
      ? service.specs.filter((item: any) => item && typeof item.label === "string" && typeof item.value === "string")
      : [],
    process: Array.isArray(service.process)
      ? service.process.filter(
          (item: any) =>
            item &&
            (typeof item.step === "number" || typeof item.step === "string") &&
            typeof item.title === "string" &&
            typeof item.description === "string"
        )
      : [],
    banDichTuongUng: Array.isArray(service.banDichTuongUng)
      ? service.banDichTuongUng.filter((item: any) => item && typeof item.language === "string" && typeof item.slug === "string")
      : [],
  }
}

function normalizeRelatedService(service: RawService | null) {
  if (!service) return null

  return {
    _id: typeof service._id === "string" ? service._id : "",
    _translationKey: typeof service._translationKey === "string" ? service._translationKey : undefined,
    title: typeof service.title === "string" ? service.title : "Dịch vụ",
    slug: typeof service.slug === "string" ? service.slug : "",
    description: typeof service.description === "string" ? service.description : "",
    icon: service.icon,
  }
}

const layChiTietDichVu = cache(async (slug: string, lang: string) => {
  const service = await sanityClient.fetch(
    `coalesce(
      *[
        _type == "service" &&
        language == $lang &&
        !(_id in path("drafts.**")) &&
        (
          slug.current == $slug ||
          (defined(_translationKey) && _translationKey == *[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey)
        )
      ][0],
      *[
        _type == "service" &&
        language == "en" &&
        !(_id in path("drafts.**")) &&
        (
          slug.current == $slug ||
          (defined(_translationKey) && _translationKey == *[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey)
        )
      ][0],
      *[
        _type == "service" &&
        language == "vi" &&
        !(_id in path("drafts.**")) &&
        (
          slug.current == $slug ||
          (defined(_translationKey) && _translationKey == *[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey)
        )
      ][0],
      *[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]
    ) {
      _id,
      _translationKey,
      title,
      shortTitle,
      "slug": slug.current,
      icon,
      description,
      "image": coalesce(image.asset->url, image),
      "tags": coalesce(tags, []),
      "features": coalesce(features, []),
      "specs": coalesce(specs, []),
      "process": coalesce(process, []),
      "labels": coalesce(labels, {
        "featuresTitle": "Tính năng nổi bật",
        "specsTitle": "Thông số kỹ thuật",
        "processTitle": "Quy trình làm việc",
        "relatedTitle": "Dịch vụ liên quan"
      }),
      language,
      "banDichTuongUng": select(
        defined(_translationKey) => *[
          _type == "service" &&
          _translationKey == ^._translationKey &&
          defined(slug.current) &&
          !(_id in path("drafts.**"))
        ] { language, "slug": slug.current },
        []
      )
    }`,
    { slug, lang }
  )

  return normalizeService(service)
})

async function layDichVuLienQuan(slugHienTai: string, lang: string) {
  const rawServices: RawService[] = await sanityClient.fetch(
    `*[_type == "service" && defined(slug.current) && slug.current != $slugHienTai && !(_id in path("drafts.**"))] | order(orderRank asc, _createdAt desc)[0...24] {
      _id,
      _translationKey,
      language,
      title,
      description,
      "slug": slug.current,
      icon
    }`,
    { slugHienTai }
  )

  const groups: Record<string, RawService[]> = {}
  rawServices.forEach((item) => {
    const key = item._translationKey || item._id
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })

  return Object.values(groups)
    .map(
      (group) =>
        group.find((item) => item.language === lang) ||
        group.find((item) => item.language === "en") ||
        group.find((item) => item.language === "vi") ||
        group[0]
    )
    .filter(Boolean)
    .flatMap((item) => {
      const normalized = normalizeRelatedService(item)
      return normalized ? [normalized] : []
    })
    .slice(0, 4)
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const [service, siteName] = await Promise.all([layChiTietDichVu(slug, lang), getSiteName()])

  if (!service) return { title: { absolute: withSiteName("Dịch vụ không tồn tại", siteName) } }

  const title = withSiteName(service.title, siteName)
  const description = service.description
  const translations = Object.fromEntries(
    (service.banDichTuongUng || []).map((item: any) => [item.language, `/${item.language}/services/${item.slug}`])
  )

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${lang}/services/${service.slug || slug}`,
      languages: {
        ...(translations.vi ? { "vi-VN": translations.vi } : {}),
        ...(translations.en ? { "en-US": translations.en } : {}),
        ...(translations.jp ? { "ja-JP": translations.jp } : {}),
        ...(translations.kr ? { "ko-KR": translations.kr } : {}),
        ...(translations.cn ? { "zh-CN": translations.cn } : {}),
      },
    },
    openGraph: {
      title,
      description,
      url: `/${lang}/services/${service.slug || slug}`,
      siteName,
      images: service.image ? [{ url: service.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: service.image ? [service.image] : [],
    },
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params

  const [service, relatedCandidates, dict, siteName] = await Promise.all([
    layChiTietDichVu(slug, lang),
    layDichVuLienQuan(slug, lang),
    getDictionary(lang),
    getSiteName(),
  ])

  if (!service) notFound()

  const currentGroupKey = service._translationKey || service._id
  const relatedServices = relatedCandidates
    .filter((item) => (item._translationKey || item._id) !== currentGroupKey)
    .slice(0, 3)
  const siteUrl = getPublicSiteUrl()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: siteName,
      url: `${siteUrl}/${lang}`,
    },
    url: `${siteUrl}/${lang}/services/${service.slug || slug}`,
    image: service.image || undefined,
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServicePageContent service={service} relatedServices={relatedServices} lang={lang} dict={dict} />
      <Footer lang={lang} dict={dict} />
    </main>
  )
}
