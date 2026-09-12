import { Footer } from "@/components/footer"
import { BlueprintBackground } from "@/components/blueprint-background"
import { BlogListContent } from "@/components/blog-list-content"
import { PageHeader } from "@/components/page-header"
import { getDictionary } from "@/lib/get-dictionary"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { getPublicSiteUrl } from "@/lib/runtime-config"
import { sanityClient } from "@/lib/sanity-client"

async function getBlogPosts(lang: string) {
  return sanityClient.fetch(`*[_type == "blogPost" && language == $lang && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id, _translationKey, title, "slug": slug.current, language, excerpt,
    "mainImage": mainImage.asset->{ url }, publishedAt, author, readTime,
    "category": category->title
  }`, { lang })
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, siteName] = await Promise.all([getDictionary(lang), getSiteName()])
  const title = withSiteName(dict.blog?.meta_title || dict.navigation?.blog || "Blog", siteName)
  const description = dict.blog?.meta_desc || dict.blog?.description || ""
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${lang}/blog`,
      languages: {
        "vi-VN": "/vi/blog",
        "en-US": "/en/blog",
        "ja-JP": "/jp/blog",
        "ko-KR": "/kr/blog",
        "zh-CN": "/cn/blog",
        "x-default": "/vi/blog",
      },
    },
    openGraph: { title, description, url: `/${lang}/blog`, siteName, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, posts, siteName] = await Promise.all([getDictionary(lang), getBlogPosts(lang), getSiteName()])
  const siteUrl = getPublicSiteUrl()
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: dict.blog?.meta_title || `${siteName} Blog`,
    description: dict.blog?.meta_desc,
    url: `${siteUrl}/${lang}/blog`,
    blogPost: posts.map((post: any) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${siteUrl}/${lang}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      image: post.mainImage?.url,
    })),
  }

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25 dark:opacity-15" aria-hidden="true"><BlueprintBackground /></div>
      <div className="relative z-10">
        <PageHeader title={dict.blog?.title} subtitle={dict.blog?.subtitle} description={dict.blog?.description} lang={lang} dict={dict} />
        <section className="pb-24 pt-10 sm:pt-12 lg:pb-28"><BlogListContent posts={posts} lang={lang} dict={dict} /></section>
      </div>
      <Footer lang={lang} dict={dict} />
    </main>
  )
}
