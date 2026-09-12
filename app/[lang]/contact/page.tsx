import { BlueprintBackground } from "@/components/blueprint-background"
import { ContactSection } from "@/components/contact-section"
import { PageHeader } from "@/components/page-header"
import { getDictionary } from "@/lib/get-dictionary"
import { getPublicSiteUrl } from "@/lib/runtime-config"
import { getSiteSettings, replaceLegacySiteName, resolveSiteName, withSiteName } from "@/lib/site-settings"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, siteSettings] = await Promise.all([getDictionary(lang), getSiteSettings()])
  const siteName = resolveSiteName(siteSettings)
  const title = withSiteName(dict.contact?.title || "Liên hệ", siteName)
  const description = replaceLegacySiteName(dict.contact?.description || "Liên hệ để trao đổi về nhu cầu và giải pháp phù hợp cho dự án của bạn.", siteName)

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: {
        "vi-VN": "/vi/contact",
        "en-US": "/en/contact",
        "ja-JP": "/jp/contact",
        "ko-KR": "/kr/contact",
        "zh-CN": "/cn/contact",
        "x-default": "/vi/contact",
      },
    },
    openGraph: { title, description, url: `/${lang}/contact`, siteName, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, siteSettings] = await Promise.all([getDictionary(lang), getSiteSettings()])
  const siteName = resolveSiteName(siteSettings)
  const siteUrl = getPublicSiteUrl()
  const localBusiness: Record<string, any> = {
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: siteName,
    url: siteUrl,
  }
  if (siteSettings?.phoneTel) localBusiness.telephone = siteSettings.phoneTel
  if (siteSettings?.addressDisplay) {
    localBusiness.address = {
      "@type": "PostalAddress",
      streetAddress: siteSettings.addressDisplay,
    }
  }
  if (siteSettings?.googleMapsUrl) localBusiness.hasMap = siteSettings.googleMapsUrl

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${siteUrl}/${lang}/contact/#webpage`,
        url: `${siteUrl}/${lang}/contact`,
        name: withSiteName(dict.contact?.title || "Liên hệ", siteName),
        description: dict.contact?.description,
      },
      localBusiness,
    ],
  }

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25 dark:opacity-15" aria-hidden="true">
        <BlueprintBackground />
      </div>
      <div className="relative z-10">
        <PageHeader
          title={dict.contact?.title || "Contact"}
          subtitle={dict.contact?.subtitle || "Get in touch"}
          description={dict.contact?.description || "Liên hệ để trao đổi về nhu cầu và giải pháp phù hợp cho dự án của bạn."}
          lang={lang}
          dict={dict}
        />
        <ContactSection lang={lang} dict={dict} />
      </div>
    </main>
  )
}
