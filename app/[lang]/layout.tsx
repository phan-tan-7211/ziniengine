import React from "react"
import type { Metadata } from "next"
import { SmartSwipeWrapper } from "@/components/smart-swipe-wrapper"
import { Navigation } from "@/components/navigation"
import { MobileWidgetIndicator } from "@/components/mobile-widget-indicator"
import { FloatingContactBar } from "@/components/floating-contact-bar"
import { Footer } from "@/components/footer"
import { SiteSettingsProvider } from "@/components/site-settings-context"
import { getDictionary } from "@/lib/get-dictionary"
import { getSiteSettings, resolveSiteName } from "@/lib/site-settings"
import { getPublicSiteUrl } from "@/lib/runtime-config"
import { sanityClient } from "@/lib/sanity-client"

async function getLocalizedServices(lang: string) {
  const items: any[] = await sanityClient.fetch(`
    *[_type == "service" && defined(slug.current) && !(_id in path("drafts.**"))] | order(orderRank asc) {
      _id, _translationKey, "slug": slug.current, icon, language, title, "desc": description, orderRank
    }
  `)
  const groups: Record<string, any[]> = {}
  items.forEach((item: any) => {
    const key = item._translationKey || item._id
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return Object.values(groups)
    .map((group: any[]) => group.find((item) => item.language === lang) || group.find((item) => item.language === "en") || group.find((item) => item.language === "vi") || group[0])
    .sort((a, b) => (a.orderRank || 0) - (b.orderRank || 0))
    .map((service) => ({ _id: service._id, slug: service.slug, icon: service.icon, language: service.language, title: service.title, desc: service.desc }))
}

async function getSharedLayoutData(lang: string) {
  const data = await sanityClient.fetch<any>(
    `{
      "legalDocs": *[_type == "legalDoc" && defined(slug.current) && !(_id in path("drafts.**"))] | order(_createdAt asc) {
        _id, language, "slug": slug.current, title
      },
      "locations": *[_type == "locationsSettings" && _id == "locationsSettings" && !(_id in path("drafts.**"))][0].locations[]{
        _key, enabled, kind, name, address, googleMapsUrl
      }
    }`,
    {},
    { next: { revalidate: 60, tags: ["shared-layout-data"] } },
  )

  const allLegalDocs = Array.isArray(data?.legalDocs) ? data.legalDocs : []
  const normalizedLegalDocs = allLegalDocs
    .map((item: any) => ({
      ...item,
      language: typeof item.language === "string" ? item.language : "vi",
      slug: typeof item.slug === "string" && item.slug.includes("/") ? item.slug.split("/").filter(Boolean).pop() : item.slug,
    }))
    .filter((item: any) => item.slug && item.title)
  const byLang = (target: string) => normalizedLegalDocs.filter((item: any) => item.language === target)
  const legalDocs = (byLang(lang).length ? byLang(lang) : byLang("en").length ? byLang("en") : byLang("vi").length ? byLang("vi") : normalizedLegalDocs).slice(0, 3)
  const locations = (Array.isArray(data?.locations) ? data.locations : []).filter((item: any) => item?.enabled !== false && item?.address?.trim())

  return { legalDocs, locations }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const [dict, siteSettings] = await Promise.all([getDictionary(lang), getSiteSettings()])
  const siteName = resolveSiteName(siteSettings)
  const cleanDescription = typeof dict.hero?.description === "string" ? dict.hero.description.replace(/<[^>]*>?/gm, "") : `${siteName}`
  const siteTitle = `${siteName} - ${dict.hero?.title_line1 || ""} ${dict.hero?.title_highlight || ""}`.trim()
  return {
    metadataBase: new URL(getPublicSiteUrl()),
    title: { default: siteTitle, template: `%s | ${siteName}` },
    description: cleanDescription,
    keywords: ["Engineering", "Manufacturing", siteName, "Services", "Products", "Projects"],
    alternates: { canonical: `/${lang}`, languages: { "vi-VN": "/vi", "en-US": "/en", "ja-JP": "/jp", "ko-KR": "/kr", "zh-CN": "/cn" } },
    openGraph: {
      type: "website",
      locale: lang === "vi" ? "vi_VN" : lang === "en" ? "en_US" : lang === "jp" ? "ja_JP" : lang === "kr" ? "ko_KR" : "zh_CN",
      title: siteTitle,
      description: cleanDescription,
      url: `/${lang}`,
      siteName,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: `${siteName} — Open Graph` }],
    },
    twitter: { card: "summary_large_image", title: siteTitle, description: cleanDescription, images: ["/og-image.jpg"] },
  }
}

export async function generateStaticParams() {
  return [{ lang: "vi" }, { lang: "en" }, { lang: "jp" }, { lang: "kr" }, { lang: "cn" }]
}

export default async function LanguageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, services, siteSettings, sharedData] = await Promise.all([
    getDictionary(lang),
    getLocalizedServices(lang),
    getSiteSettings(),
    getSharedLayoutData(lang),
  ])
  const settings = siteSettings || {}
  const sharedSettings = { ...settings, sharedLocations: sharedData.locations }
  const effectiveDict = {
    ...dict,
    common: {
      ...dict.common,
      phone_label: settings.phoneDisplay || "",
      email_label: settings.email || "",
    },
  }
  const servicesSlugs = services.map(({ slug, icon }) => ({ slug, icon }))

  return (
    <SiteSettingsProvider value={sharedSettings}>
      <Navigation lang={lang} dict={effectiveDict} initialServices={services} />
      <SmartSwipeWrapper lang={lang} services={servicesSlugs}>
        <div className="mx-auto min-h-dvh w-full overflow-hidden xl:w-[calc(100%-10rem)] xl:max-w-[1440px] xl:border-x xl:border-border/50 xl:shadow-[0_0_50px_rgba(15,23,42,0.08)] dark:xl:shadow-[0_0_50px_rgba(0,0,0,0.28)]">
          {children}
          <Footer lang={lang} dict={effectiveDict} initialServices={services} initialLegalDocs={sharedData.legalDocs} />
        </div>
      </SmartSwipeWrapper>
      <MobileWidgetIndicator lang={lang} dict={effectiveDict} services={servicesSlugs} />
      <FloatingContactBar />
    </SiteSettingsProvider>
  )
}
