import { notFound } from "next/navigation"
import { cache, Suspense } from "react"
import { ArrowRight } from "lucide-react"
import { ServicePageContent } from "@/components/service-page-content"
import { getDictionary } from "@/lib/get-dictionary"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { Footer } from "@/components/footer"
import { DetailCollectionLink } from "@/components/detail-collection-link"
import { SmartPrefetchLink } from "@/components/smart-prefetch-link"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
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

async function RelatedServices({ service, lang, dict }: { service: any; lang: string; dict: any }) {
  const relatedCandidates = await layDichVuLienQuan(service.slug, lang)
  const currentGroupKey = service._translationKey || service._id
  const relatedServices = relatedCandidates
    .filter((item) => (item._translationKey || item._id) !== currentGroupKey)
    .slice(0, 3)

  if (relatedServices.length === 0) {
    return (
      <section className="border-t border-border/50 bg-background py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <DetailCollectionLink href={`/${lang}/services`} label={dict?.navigation?.view_all_services || "Xem tất cả dịch vụ kỹ thuật"} />
        </div>
      </section>
    )
  }

  return (
    <section className="section-space border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{dict?.navigation?.services || "Dịch vụ"}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">{service.labels?.relatedTitle || "Dịch vụ liên quan"}</h2>
          </div>
          <DetailCollectionLink href={`/${lang}/services`} label={dict?.navigation?.view_all_services || "Xem tất cả dịch vụ kỹ thuật"} />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {relatedServices.map((related, index) => (
            <SmartPrefetchLink
              key={`${related.slug}-${index}`}
              href={`/${lang}/services/${related.slug}`}
              className="group flex h-full min-h-44 flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hover:-translate-y-2 lg:hover:scale-[1.015] lg:hover:border-primary/35 lg:hover:shadow-card"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all lg:group-hover:rotate-6 lg:group-hover:scale-110 lg:group-hover:bg-primary lg:group-hover:text-primary-foreground">
                <DynamicIcon iconData={related.icon} className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground transition-colors lg:group-hover:text-primary">{related.title}</h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">{related.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">{dict?.services?.read_more || dict?.common?.read_more}<ArrowRight className="size-4 transition-transform lg:group-hover:translate-x-1.5" aria-hidden="true" /></span>
            </SmartPrefetchLink>
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedServicesSkeleton() {
  return (
    <section className="section-space border-t border-border/50 bg-background" aria-hidden="true">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-56 rounded bg-muted" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-44 rounded-2xl bg-muted" />
            <div className="h-44 rounded-2xl bg-muted" />
            <div className="h-44 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </section>
  )
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

  const [service, dict, siteName] = await Promise.all([
    layChiTietDichVu(slug, lang),
    getDictionary(lang),
    getSiteName(),
  ])

  if (!service) notFound()

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
      <ServicePageContent service={service} relatedServices={null} lang={lang} dict={dict} />
      <Suspense fallback={<RelatedServicesSkeleton />}>
        <RelatedServices service={service} lang={lang} dict={dict} />
      </Suspense>
      <Footer lang={lang} dict={dict} />
    </main>
  )
}
