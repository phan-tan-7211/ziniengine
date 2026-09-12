import { HeroSection } from "@/components/hero-section"
import { BlueprintBackground } from "@/components/blueprint-background"
import { FeaturedProjects } from "@/components/featured-projects"
import { AboutSummary } from "@/components/about-summary"
import { Button } from "@/components/ui/button"
import { BlogCarousel } from "@/components/blog-carousel"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getDictionary } from "@/lib/get-dictionary"
import { fetchSeoData } from "@/lib/fetch-seo-data"
import { getSiteSettings, resolveSiteName, withSiteName } from "@/lib/site-settings"
import { getPublicSiteUrl } from "@/lib/runtime-config"
import { sanityClient } from "@/lib/sanity-client"
import { legacyDictionaryMatchesBrand } from "@/sanity/bootstrap/legacyDictionaryBootstrap"

type LocalizedContent = { language?: string; _translationKey?: string; slug?: string }
type BlogPost = LocalizedContent & { title: string; excerpt?: string; imageUrl?: string; categoryName?: string }
type Project = LocalizedContent & { title: string; client?: string; imageUrl?: string; categoryName?: string }
type SiteLocale = "vi" | "en" | "jp" | "kr" | "cn"

function selectLocalizedItems<T extends LocalizedContent>(items: T[], lang: string, limit: number): T[] {
  const grouped = new Map<string, T[]>()
  items.forEach((item, index) => {
    const key = item._translationKey || item.slug || `item-${index}`
    const group = grouped.get(key) || []
    group.push(item)
    grouped.set(key, group)
  })
  return Array.from(grouped.values())
    .map((group) => group.find((item) => item.language === lang) || group.find((item) => item.language === "en") || group.find((item) => item.language === "vi") || group[0])
    .filter(Boolean)
    .slice(0, limit)
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [seo, siteSettings, dictionary] = await Promise.all([fetchSeoData(lang, "home"), getSiteSettings(), getDictionary(lang)])
  const siteName = resolveSiteName(siteSettings)
  const locale = (["vi", "en", "jp", "kr", "cn"].includes(lang) ? lang : "vi") as SiteLocale
  const tagline = siteSettings.logoWordmark?.tagline?.[locale] || dictionary.common?.logo_subtitle || "Engineering Solutions"
  const fallbackTitle = `${siteName} | ${tagline}`
  const fallbackDescription = typeof dictionary.hero?.description === "string" && dictionary.hero.description.trim() ? dictionary.hero.description.replace(/<[^>]*>?/gm, "") : `${siteName} — ${tagline}`
  const title = withSiteName(seo?.metaTitle || fallbackTitle, siteName)
  const description = seo?.metaDescription || fallbackDescription
  const ogImage = seo?.openGraphImage?.asset?.url
  return {
    title: { absolute: title }, description,
    alternates: { canonical: `/${lang}`, languages: { "vi-VN": "/vi", "en-US": "/en", "zh-CN": "/cn", "ja-JP": "/jp", "ko-KR": "/kr" } },
    openGraph: { type: "website", title, description, url: `/${lang}`, siteName, images: ogImage ? [{ url: ogImage }] : [] },
    twitter: { card: "summary_large_image", title, description, images: ogImage ? [ogImage] : [] },
  }
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dictionary, siteSettings] = await Promise.all([getDictionary(lang), getSiteSettings()])
  const siteName = resolveSiteName(siteSettings)
  const allowLegacyCompanyFallbacks = legacyDictionaryMatchesBrand(siteName)
  const siteUrl = getPublicSiteUrl()
  const blogDictionary = (dictionary.blog as Record<string, string>) || {}
  const newsDictionary = (dictionary.news_section as Record<string, string>) || {}

  const blogQuery = `*[_type == "blogPost" && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedAt desc) { title, "slug": slug.current, excerpt, "imageUrl": mainImage.asset->url, "categoryName": category->title, language, _translationKey }`
  const projectQuery = `*[_type == "project" && defined(slug.current) && !(_id in path("drafts.**"))] | order(_createdAt desc) { title, "slug": slug.current, client, "categoryName": serviceCategory->title, "imageUrl": mainImage.asset->url, language, _translationKey }`

  const [allPosts, allProjects] = await Promise.all([
    sanityClient.fetch<BlogPost[]>(blogQuery),
    sanityClient.fetch<Project[]>(projectQuery),
  ])
  const latestPosts = selectLocalizedItems(allPosts, lang, 5)
  const latestProjects = selectLocalizedItems(allProjects, lang, 6)

  const sameAs = [siteSettings.facebookUrl, siteSettings.youtubeUrl, siteSettings.tiktokUrl, siteSettings.twitterUrl, siteSettings.lineUrl, siteSettings.wechatUrl, siteSettings.zaloNumber ? `https://zalo.me/${encodeURIComponent(siteSettings.zaloNumber.replace(/\s+/g, ""))}` : undefined].filter((url): url is string => Boolean(url))
  const contactPoint = siteSettings.phoneTel || siteSettings.email ? { "@type": "ContactPoint", ...(siteSettings.phoneTel ? { telephone: siteSettings.phoneTel } : {}), ...(siteSettings.email ? { email: siteSettings.email } : {}), contactType: "customer service", availableLanguage: ["Vietnamese", "English", "Japanese", "Korean", "Chinese"] } : undefined
  const jsonLd = { "@context": "https://schema.org", "@type": ["Organization", "LocalBusiness"], name: siteName, url: `${siteUrl}/${lang}`, image: `${siteUrl}/og-image.jpg`, description: typeof dictionary.hero?.description === "string" ? dictionary.hero.description.replace(/<[^>]*>?/gm, "") : undefined, ...(siteSettings.addressDisplay ? { address: { "@type": "PostalAddress", streetAddress: siteSettings.addressDisplay, addressCountry: "VN" } } : {}), ...(contactPoint ? { contactPoint } : {}), ...(sameAs.length > 0 ? { sameAs } : {}) }

  return (
    <main id="main-content" className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30" aria-hidden="true"><BlueprintBackground /></div>
      <div className="relative z-10 pt-20 lg:pt-24">
        <HeroSection dict={dictionary} lang={lang} />
        <AboutSummary dict={dictionary} lang={lang} siteName={siteName} />
        <FeaturedProjects dict={dictionary} projects={latestProjects} lang={lang} allowLegacyFallback={allowLegacyCompanyFallbacks} />
        <section aria-labelledby="news-section-title" className="relative border-y border-border/70 bg-card/40 py-20 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-7 md:mb-12 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3"><span className="h-px w-10 bg-primary sm:w-12" aria-hidden="true" /><span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{newsDictionary.badge}</span></div>
                <h2 id="news-section-title" className="max-w-xl text-balance font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">{newsDictionary.title_main} <span className="text-primary">{newsDictionary.title_highlight}</span></h2>
                <p className="mt-5 max-w-[65ch] text-base leading-7 text-muted-foreground sm:text-lg">{newsDictionary.description}</p>
              </div>
              <Button asChild variant="outline" className="group min-h-12 w-fit rounded-full border-primary/40 bg-background/70 px-6 text-base font-semibold text-primary shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Link href={`/${lang}/blog`} aria-label={newsDictionary.view_all}>{newsDictionary.view_all}<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
              </Button>
            </div>
            {latestPosts.length > 0 ? <BlogCarousel posts={latestPosts} lang={lang} readMoreText={blogDictionary.read_more} categoryNewsText={blogDictionary.category_news} /> : <div className="rounded-2xl border border-dashed border-border bg-background/70 px-6 py-12 text-center"><p className="text-base text-muted-foreground">{blogDictionary.no_posts}</p></div>}
          </div>
        </section>
      </div>
    </main>
  )
}
