import { notFound } from "next/navigation"
import { cache, Suspense } from "react"
import { getDictionary } from "@/lib/get-dictionary"
import { PortableText } from "@portabletext/react"
import { ArrowRight, Calendar, ChevronRight, Clock, Home, Tag, User } from "lucide-react"
import Link from "next/link"
import { SanityImage } from "@/components/sanity-image"
import { Footer } from "@/components/footer"
import { SmartPrefetchLink } from "@/components/smart-prefetch-link"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { sanityClient } from "@/lib/sanity-client"
import { getPublicSiteUrl } from "@/lib/runtime-config"

type RawPost = Record<string, any>

const getPost = cache(async (slug: string, lang: string) => {
  return sanityClient.fetch(
    `coalesce(
      *[
        _type == "blogPost" &&
        language == $lang &&
        !(_id in path("drafts.**")) &&
        (
          slug.current == $slug ||
          (defined(_translationKey) && _translationKey == *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey)
        )
      ][0],
      *[
        _type == "blogPost" &&
        language == "en" &&
        !(_id in path("drafts.**")) &&
        (
          slug.current == $slug ||
          (defined(_translationKey) && _translationKey == *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey)
        )
      ][0],
      *[
        _type == "blogPost" &&
        language == "vi" &&
        !(_id in path("drafts.**")) &&
        (
          slug.current == $slug ||
          (defined(_translationKey) && _translationKey == *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey)
        )
      ][0],
      *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0]
    ) {
      _id,
      _translationKey,
      title,
      excerpt,
      body,
      publishedAt,
      author,
      readTime,
      language,
      "slug": slug.current,
      "mainImage": mainImage.asset->{ _id, url },
      "category": category->{ title, "slug": slug.current },
      "translations": select(
        defined(_translationKey) => *[
          _type == "blogPost" &&
          _translationKey == ^._translationKey &&
          defined(slug.current) &&
          !(_id in path("drafts.**"))
        ] { language, "slug": slug.current },
        []
      )
    }`,
    { slug, lang }
  )
})

async function getRelated(currentId: string, lang: string) {
  return sanityClient.fetch(
    `*[
      _type == "blogPost" &&
      _id != $currentId &&
      language == $lang &&
      defined(slug.current) &&
      !(_id in path("drafts.**"))
    ] | order(publishedAt desc)[0...3] {
      _id,
      title,
      "slug": slug.current,
      "mainImage": mainImage.asset->{ url },
      publishedAt
    }`,
    { currentId, lang }
  )
}

async function RelatedArticles({ post, lang, dict }: { post: any; lang: string; dict: any }) {
  const related = await getRelated(post._id, post.language || lang)
  if (!related.length) return null

  return (
    <section className="mt-24">
      <h2 className="font-serif text-2xl font-bold sm:text-3xl">{dict.blog?.related_posts || "Related articles"}</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {related.map((item: RawPost, index: number) => (
          <SmartPrefetchLink
            key={item._id}
            href={`/${lang}/blog/${item.slug}`}
            prefetch={index === 0}
            className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all lg:hover:-translate-y-1 lg:hover:border-primary/40 lg:hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="aspect-video overflow-hidden"><SanityImage imageData={item.mainImage} alt={item.title} width={600} height={400} className="h-full w-full object-cover transition-transform duration-700 lg:group-hover:scale-110" /></div>
            <h3 className="p-4 font-semibold leading-snug transition-colors lg:group-hover:text-primary">{item.title}</h3>
          </SmartPrefetchLink>
        ))}
      </div>
    </section>
  )
}

function RelatedArticlesSkeleton() {
  return (
    <section className="mt-24 animate-pulse" aria-hidden="true">
      <div className="h-8 w-52 rounded bg-muted" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="h-60 rounded-2xl bg-muted" />
        <div className="h-60 rounded-2xl bg-muted" />
        <div className="h-60 rounded-2xl bg-muted" />
      </div>
    </section>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const [post, siteName] = await Promise.all([getPost(slug, lang), getSiteName()])
  if (!post) return { title: { absolute: withSiteName("Bài viết không tồn tại", siteName) } }

  const title = withSiteName(post.title, siteName)
  const description = post.excerpt || ""
  const translationMap = Object.fromEntries((post.translations || []).map((item: any) => [item.language, `/${item.language}/blog/${item.slug}`]))

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${lang}/blog/${post.slug || slug}`,
      languages: {
        ...(translationMap.vi ? { "vi-VN": translationMap.vi } : {}),
        ...(translationMap.en ? { "en-US": translationMap.en } : {}),
        ...(translationMap.jp ? { "ja-JP": translationMap.jp } : {}),
        ...(translationMap.kr ? { "ko-KR": translationMap.kr } : {}),
        ...(translationMap.cn ? { "zh-CN": translationMap.cn } : {}),
      },
    },
    openGraph: { title, description, url: `/${lang}/blog/${post.slug || slug}`, siteName, type: "article", publishedTime: post.publishedAt, authors: [post.author || `${siteName} Team`], images: post.mainImage?.url ? [{ url: post.mainImage.url }] : [] },
    twitter: { card: "summary_large_image", title, description, images: post.mainImage?.url ? [post.mainImage.url] : [] },
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const [dict, post, siteName] = await Promise.all([getDictionary(lang), getPost(slug, lang), getSiteName()])
  if (!post) notFound()

  const locale = lang === "vi" ? "vi-VN" : lang === "jp" ? "ja-JP" : lang === "kr" ? "ko-KR" : lang === "cn" ? "zh-CN" : "en-US"
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" }) : ""
  const siteUrl = getPublicSiteUrl()
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.excerpt, image: post.mainImage?.url, author: { "@type": "Organization", name: post.author || `${siteName} Team` }, publisher: { "@type": "Organization", name: siteName }, datePublished: post.publishedAt, mainEntityOfPage: `${siteUrl}/${lang}/blog/${post.slug || slug}` }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="container relative isolate mx-auto px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        <div className="pointer-events-none absolute left-8 top-32 hidden size-24 border-l border-t border-primary/20 lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-8 right-8 hidden size-24 border-b border-r border-border/70 lg:block" aria-hidden="true" />
        <nav className="relative z-10 mb-7 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 text-sm sm:mb-8" aria-label="Breadcrumb">
          <div className="flex min-w-0 items-center gap-2">
            <Home className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Link href={`/${lang}`} className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">{dict.common?.home || "Trang chủ"}</Link>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
            <Link href={`/${lang}/blog`} className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">{dict.navigation?.blog || dict.blog?.title || "Blog"}</Link>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
            <span className="max-w-[70vw] truncate font-medium text-primary" aria-current="page" title={post.title}>{post.title}</span>
          </div>
        </nav>

        <header className="mx-auto max-w-4xl text-center">
          <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"><Tag className="size-4" aria-hidden="true" />{post.category?.title || "TECH"}</div>
          <h1 className="mt-6 text-balance font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{post.title}</h1>
          <p className="mx-auto mt-6 max-w-[68ch] text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-y border-border/60 py-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><User className="size-4 text-primary" aria-hidden="true" />{post.author || `${siteName} Team`}</span>
            {date && <span className="flex items-center gap-2"><Calendar className="size-4 text-primary" aria-hidden="true" />{date}</span>}
            <span className="flex items-center gap-2"><Clock className="size-4 text-primary" aria-hidden="true" />{post.readTime || "5 min"}</span>
          </div>
        </header>

        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border border-border/70 shadow-card">
          <div className="relative aspect-[16/9]"><SanityImage imageData={post.mainImage} alt={post.title} width={1600} height={900} className="h-full w-full object-cover" priority /></div>
        </div>

        <div className="prose prose-slate mx-auto mt-14 max-w-3xl dark:prose-invert prose-headings:font-serif prose-a:text-primary prose-p:leading-8">
          <PortableText value={Array.isArray(post.body) ? post.body : []} />
        </div>

        <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
          <Link href={`/${lang}/blog`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/35 px-5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{dict.news_section?.view_all || "View all articles"}<ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href={`/${lang}/contact`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform lg:hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{dict.common?.contact_btn || "Contact us"}</Link>
        </div>

        <Suspense fallback={<RelatedArticlesSkeleton />}>
          <RelatedArticles post={post} lang={lang} dict={dict} />
        </Suspense>
      </article>
      <Footer lang={lang} dict={dict} />
    </main>
  )
}
