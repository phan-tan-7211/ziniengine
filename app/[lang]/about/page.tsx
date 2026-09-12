import { BlueprintBackground } from "@/components/blueprint-background"
import { AboutSection } from "@/components/about-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PageHeader } from "@/components/page-header"
import { getDictionary } from "@/lib/get-dictionary"
import { getPublicSiteUrl } from "@/lib/runtime-config"
import { getSiteName, replaceLegacySiteName, withSiteName } from "@/lib/site-settings"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, siteName] = await Promise.all([getDictionary(lang), getSiteName()])
  const title = withSiteName(dict.about_page?.meta_title || "Giới thiệu", siteName)
  const description = replaceLegacySiteName(dict.about_page?.header_desc || "Thông tin về doanh nghiệp, năng lực và định hướng phát triển.", siteName)

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${lang}/about`,
      languages: {
        "vi-VN": "/vi/about",
        "en-US": "/en/about",
        "ja-JP": "/jp/about",
        "ko-KR": "/kr/about",
        "zh-CN": "/cn/about",
        "x-default": "/vi/about",
      },
    },
    openGraph: { title, description, url: `/${lang}/about`, siteName, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, siteName] = await Promise.all([getDictionary(lang), getSiteName()])
  const siteUrl = getPublicSiteUrl()
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${siteUrl}/${lang}/about/#webpage`,
        url: `${siteUrl}/${lang}/about`,
        name: withSiteName(dict.about_page?.meta_title || "Giới thiệu", siteName),
        description: dict.about_page?.header_desc,
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
      },
    ],
  }

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30 dark:opacity-20" aria-hidden="true">
        <BlueprintBackground />
      </div>
      <div className="relative z-10">
        <PageHeader
          title={dict.about_page?.header_title || "Giới thiệu"}
          subtitle={dict.about_page?.header_subtitle || "Về chúng tôi"}
          description={dict.about_page?.header_top_desc || "Thông tin về doanh nghiệp, năng lực và định hướng phát triển."}
          lang={lang}
          dict={dict}
        />
        <AboutSection lang={lang} dict={dict} siteName={siteName} />
        <TestimonialsSection lang={lang} dict={dict} />
      </div>
    </main>
  )
}
