import React from "react"
import type { Metadata } from 'next'
import { SmartSwipeWrapper } from "@/components/smart-swipe-wrapper"
import { Navigation } from "@/components/navigation"
import { MobileWidgetIndicator } from "@/components/mobile-widget-indicator"
import { FloatingContactBar } from "@/components/floating-contact-bar"
import { SiteSettingsProvider } from "@/components/site-settings-context"
import { getDictionary } from "@/lib/get-dictionary"
import { getSiteSettings, resolveSiteName } from "@/lib/site-settings"
import { getPublicSiteUrl } from "@/lib/runtime-config"
import { sanityClient } from "@/lib/sanity-client"

async function getLocalizedServices(lang: string) {
  const items: any[] = await sanityClient.fetch(`
    *[_type == "service" && language == $lang && defined(slug.current) && !(_id in path("drafts.**"))] | order(orderRank asc) {
      _id, _translationKey, "slug": slug.current, icon, language, title, "desc": description, orderRank
    }
  `, { lang })

  return items
    .sort((a, b) => (a.orderRank || 0) - (b.orderRank || 0))
    .map((service) => ({ slug: service.slug, icon: service.icon, language: service.language, title: service.title, desc: service.desc }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const [dict, siteSettings] = await Promise.all([getDictionary(lang), getSiteSettings()])
  const siteName = resolveSiteName(siteSettings)
  const cleanDescription = typeof dict.hero?.description === 'string' ? dict.hero.description.replace(/<[^>]*>?/gm, '') : `${siteName}`
  const siteTitle = `${siteName} - ${dict.hero?.title_line1 || ''} ${dict.hero?.title_highlight || ''}`.trim()
  return {
    metadataBase: new URL(getPublicSiteUrl()),
    title: { default: siteTitle, template: `%s | ${siteName}` },
    description: cleanDescription,
    keywords: ['Engineering', 'Manufacturing', siteName, 'Services', 'Products', 'Projects'],
    alternates: { canonical: `/${lang}`, languages: { 'vi-VN': '/vi', 'en-US': '/en', 'ja-JP': '/jp', 'ko-KR': '/kr', 'zh-CN': '/cn' } },
    openGraph: {
      type: 'website',
      locale: lang === 'vi' ? 'vi_VN' : lang === 'en' ? 'en_US' : lang === 'jp' ? 'ja_JP' : lang === 'kr' ? 'ko_KR' : 'zh_CN',
      title: siteTitle,
      description: cleanDescription,
      url: `/${lang}`,
      siteName,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: `${siteName} — Open Graph` }],
    },
    twitter: { card: 'summary_large_image', title: siteTitle, description: cleanDescription, images: ['/og-image.jpg'] },
  }
}

export async function generateStaticParams() {
  return [{ lang: 'vi' }, { lang: 'en' }, { lang: 'jp' }, { lang: 'kr' }, { lang: 'cn' }]
}

export default async function LanguageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, services, siteSettings] = await Promise.all([getDictionary(lang), getLocalizedServices(lang), getSiteSettings()])
  const settings = siteSettings || {}
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
    <SiteSettingsProvider value={settings}>
      <Navigation lang={lang} dict={effectiveDict} initialServices={services} />
      <SmartSwipeWrapper lang={lang} services={servicesSlugs}>
        <main className="mx-auto min-h-dvh w-full overflow-hidden xl:w-[calc(100%-10rem)] xl:max-w-[1440px] xl:border-x xl:border-border/50 xl:shadow-[0_0_50px_rgba(15,23,42,0.08)] dark:xl:shadow-[0_0_50px_rgba(0,0,0,0.28)]">
          {children}
        </main>
      </SmartSwipeWrapper>
      <MobileWidgetIndicator lang={lang} dict={effectiveDict} services={servicesSlugs} />
      <FloatingContactBar />
    </SiteSettingsProvider>
  )
}
