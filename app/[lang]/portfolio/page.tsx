import { Footer } from "@/components/footer"
import { BlueprintBackground } from "@/components/blueprint-background"
import { PortfolioListContent } from "@/components/portfolio-list-content"
import { PageHeader } from "@/components/page-header"
import { getDictionary } from "@/lib/get-dictionary"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { sanityClient } from "@/lib/sanity-client"
import { getPublicSiteUrl } from "@/lib/runtime-config"

async function layDuLieuPortfolio(lang: string) {
  const projectQuery = `
    *[_type == "project" && language == $lang && defined(slug.current) && !(_id in path("drafts.**"))] {
      _id,
      _translationKey,
      title,
      client,
      description,
      "slug": slug.current,
      language,
      "image": mainImage.asset->{ url },
      "categoryIdentifier": coalesce(serviceCategory->_translationKey, serviceCategory->_id)
    }
  `

  const categoryQuery = `
    *[_type == "service" && language == $lang && defined(slug.current) && !(_id in path("drafts.**"))] | order(orderRank asc) {
      _id,
      _translationKey,
      language,
      title,
      orderRank
    }
  `

  const [projects, rawCategories] = await Promise.all([
    sanityClient.fetch(projectQuery, { lang }),
    sanityClient.fetch(categoryQuery, { lang }),
  ])

  const categories = rawCategories
    .map((category: any) => ({
      _id: category._translationKey || category._id,
      title: category.title,
      orderRank: category.orderRank || 0,
    }))
    .sort((a: any, b: any) => a.orderRank - b.orderRank)

  return { projects, categories }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, siteName] = await Promise.all([getDictionary(lang), getSiteName()])
  const title = withSiteName(dict.portfolio?.meta_title || dict.portfolio?.title || dict.navigation?.projects || "Projects", siteName)
  const description = dict.portfolio?.meta_desc || dict.portfolio?.description || ""

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${lang}/portfolio`,
      languages: {
        "vi-VN": "/vi/portfolio",
        "en-US": "/en/portfolio",
        "ja-JP": "/jp/portfolio",
        "ko-KR": "/kr/portfolio",
        "zh-CN": "/cn/portfolio",
      },
    },
    openGraph: { title, description, url: `/${lang}/portfolio`, siteName },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function PortfolioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, data, siteName] = await Promise.all([
    getDictionary(lang),
    layDuLieuPortfolio(lang),
    getSiteName(),
  ])
  const siteUrl = getPublicSiteUrl()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: dict.portfolio?.title || `${siteName} Projects`,
    description: dict.portfolio?.description,
    itemListElement: data.projects.map((project: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/${lang}/portfolio/${project.slug}`,
      name: project.title,
      description: project.description,
      image: project.image?.url,
    })),
  }

  return (
    <main className="relative min-h-dvh bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25 dark:opacity-45" aria-hidden="true"><BlueprintBackground /></div>
      <div className="relative z-10">
        <PageHeader title={dict.portfolio?.title} description={dict.portfolio?.description} subtitle={dict.portfolio?.subtitle} lang={lang} dict={dict} />
        <section className="relative z-10 pb-24 sm:pb-28 lg:pb-32">
          <PortfolioListContent projects={data.projects} categories={data.categories as any} lang={lang} dict={dict} />
        </section>
      </div>
      <Footer lang={lang} dict={dict} />
    </main>
  )
}
