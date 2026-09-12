import { notFound } from "next/navigation"
import { cache, Suspense } from "react"
import { getDictionary } from "@/lib/get-dictionary"
import { PortableText } from "@portabletext/react"
import { Calendar, ChevronRight, Home, Tag, User } from "lucide-react"
import Link from "next/link"
import { DetailRelatedSection } from "@/components/detail-related-section"
import { SanityImage } from "@/components/sanity-image"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { sanityClient } from "@/lib/sanity-client"

const layChiTietDuAn = cache(async (slug: string, lang: string) => {
  const project = await sanityClient.fetch(
    `coalesce(
      *[
        _type == "project" && language == $lang && !(_id in path("drafts.**")) &&
        (slug.current == $slug || (defined(_translationKey) && _translationKey == *[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey))
      ][0],
      *[
        _type == "project" && language == "en" && !(_id in path("drafts.**")) &&
        (slug.current == $slug || (defined(_translationKey) && _translationKey == *[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey))
      ][0],
      *[
        _type == "project" && language == "vi" && !(_id in path("drafts.**")) &&
        (slug.current == $slug || (defined(_translationKey) && _translationKey == *[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0]._translationKey))
      ][0],
      *[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0]
    ) {
      _id,
      _translationKey,
      "_metadataGroupId": *[_type == "translation.metadata" && "project" in schemaTypes && references(^._id)][0]._id,
      title,
      client,
      projectYear,
      description,
      content,
      language,
      "slug": slug.current,
      "image": mainImage.asset->{ _id, url },
      "gallery": coalesce(gallery[].asset->{ _id, url }, []),
      "categoryIdentifier": coalesce(serviceCategory->_translationKey, serviceCategory->_id),
      "serviceCategory": coalesce(
        *[_type == "service" && _translationKey == ^.serviceCategory->_translationKey && language == $lang && !(_id in path("drafts.**"))][0],
        *[_type == "service" && _translationKey == ^.serviceCategory->_translationKey && language == "en" && !(_id in path("drafts.**"))][0],
        *[_type == "service" && _translationKey == ^.serviceCategory->_translationKey && language == "vi" && !(_id in path("drafts.**"))][0],
        serviceCategory->
      ) { title, "slug": slug.current },
      "translations": select(
        defined(_translationKey) => *[_type == "project" && _translationKey == ^._translationKey && defined(slug.current) && !(_id in path("drafts.**"))] { language, "slug": slug.current },
        []
      )
    }`,
    { slug, lang }
  )

  if (!project) return null
  return {
    ...project,
    title: typeof project.title === "string" ? project.title : "Dự án",
    description: typeof project.description === "string" ? project.description : "",
    gallery: Array.isArray(project.gallery) ? project.gallery.filter(Boolean) : [],
    translations: Array.isArray(project.translations) ? project.translations : [],
  }
})

async function layDuAnLienQuan(project: any, lang: string) {
  if (!project?.categoryIdentifier) return []

  const rawProjects: any[] = await sanityClient.fetch(
    `*[
      _type == "project" &&
      defined(slug.current) &&
      coalesce(serviceCategory->_translationKey, serviceCategory->_id) == $categoryIdentifier &&
      !(_id in path("drafts.**"))
    ] | order(_createdAt desc)[0...24] {
      _id,
      _translationKey,
      "_metadataGroupId": *[_type == "translation.metadata" && "project" in schemaTypes && references(^._id)][0]._id,
      title,
      projectYear,
      description,
      "slug": slug.current,
      language,
      "image": mainImage.asset->{ _id, url }
    }`,
    { categoryIdentifier: project.categoryIdentifier },
  )

  const groups: Record<string, any[]> = {}
  rawProjects.forEach((item) => {
    const key = item._metadataGroupId || item._translationKey || item._id
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })

  const currentGroupKey = project._metadataGroupId || project._translationKey || project._id
  return Object.entries(groups)
    .filter(([key]) => key !== currentGroupKey)
    .map(([, group]) => group.find((item) => item.language === lang) || group.find((item) => item.language === "en") || group.find((item) => item.language === "vi") || group[0])
    .filter(Boolean)
    .slice(0, 3)
}

async function RelatedProjects({ project, lang, dict }: { project: any; lang: string; dict: any }) {
  const relatedProjects = await layDuAnLienQuan(project, lang)
  const relatedItems = relatedProjects.map((item: any) => ({
    id: item._metadataGroupId || item._translationKey || item._id,
    href: `/${lang}/portfolio/${item.slug}`,
    title: item.title,
    description: item.description,
    imageUrl: item.image?.url,
    eyebrow: item.projectYear || project.serviceCategory?.title,
  }))

  return (
    <DetailRelatedSection
      eyebrow={dict.navigation?.projects || dict.portfolio?.title || "Dự án"}
      title={dict.portfolio?.related_title || "Dự án liên quan"}
      items={relatedItems}
      viewAllHref={`/${lang}/portfolio`}
      viewAllLabel={dict.navigation?.view_all_projects || "Xem tất cả dự án"}
      readMoreLabel={dict.common?.read_more || "Xem chi tiết"}
    />
  )
}

function RelatedProjectsSkeleton() {
  return (
    <section className="section-space border-t border-border/50 bg-background" aria-hidden="true">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-56 rounded bg-muted" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-72 rounded-[var(--radius-card)] bg-muted" />
            <div className="h-72 rounded-[var(--radius-card)] bg-muted" />
            <div className="h-72 rounded-[var(--radius-card)] bg-muted" />
          </div>
        </div>
      </div>
    </section>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const [project, siteName] = await Promise.all([layChiTietDuAn(slug, lang), getSiteName()])
  if (!project) return { title: { absolute: withSiteName("Dự án không tồn tại", siteName) } }

  const translations = Object.fromEntries(project.translations.map((item: any) => [item.language, `/${item.language}/portfolio/${item.slug}`]))
  return {
    title: { absolute: withSiteName(project.title, siteName) },
    description: project.description,
    alternates: {
      canonical: `/${lang}/portfolio/${project.slug || slug}`,
      languages: {
        ...(translations.vi ? { "vi-VN": translations.vi } : {}),
        ...(translations.en ? { "en-US": translations.en } : {}),
        ...(translations.jp ? { "ja-JP": translations.jp } : {}),
        ...(translations.kr ? { "ko-KR": translations.kr } : {}),
        ...(translations.cn ? { "zh-CN": translations.cn } : {}),
      },
    },
    openGraph: {
      title: project.title,
      description: project.description,
      url: `/${lang}/portfolio/${project.slug || slug}`,
      siteName,
      images: project.image?.url ? [{ url: project.image.url }] : [],
    },
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const [dict, project] = await Promise.all([getDictionary(lang), layChiTietDuAn(slug, lang)])
  if (!project) notFound()

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border/60 bg-background pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.025] via-transparent to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl sm:h-96 sm:w-96" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-35 dark:opacity-55" aria-hidden="true" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-7 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 text-sm sm:mb-8" aria-label="Breadcrumb">
            <div className="flex min-w-0 items-center gap-2"><Home className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><Link href={`/${lang}`} className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">{dict.common?.home || "Trang chủ"}</Link></div>
            <div className="flex min-w-0 items-center gap-2"><ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" /><Link href={`/${lang}/portfolio`} className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">{dict.navigation?.projects || dict.portfolio?.title || "Dự án"}</Link></div>
            <div className="flex min-w-0 items-center gap-2"><ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" /><span className="max-w-[70vw] truncate font-medium text-primary" aria-current="page" title={project.title}>{project.title}</span></div>
          </nav>

          <div className="max-w-4xl">
            {project.serviceCategory?.title && <div className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary"><Tag className="size-4" aria-hidden="true" />{project.serviceCategory.title}</div>}
            <h1 className="text-balance font-serif text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">{project.title}</h1>
            {project.description && <p className="mt-6 max-w-[68ch] border-l-2 border-primary pl-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{project.description}</p>}
          </div>
        </div>
        <div className="pointer-events-none absolute left-8 top-32 hidden size-24 border-l border-t border-primary/20 lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-8 right-8 hidden size-24 border-b border-r border-border/70 lg:block" aria-hidden="true" />
      </section>

      <section className="section-space">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <article className="lg:col-span-8">
              <div className="relative aspect-video overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-card shadow-card">
                <SanityImage imageData={project.image} alt={project.title} width={1200} height={800} className="h-full w-full object-cover" priority />
              </div>
              {project.content && <div className="prose prose-slate mt-10 max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-primary prose-strong:text-foreground"><PortableText value={project.content} /></div>}
              {project.gallery.length > 0 && (
                <div className="mt-14 border-t border-border/50 pt-10">
                  <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">{dict.portfolio?.gallery_title || "Hình ảnh thực tế"}</h2>
                  <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {project.gallery.map((image: any, index: number) => <div key={image._id || index} className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all lg:hover:-translate-y-1 lg:hover:border-primary/35 lg:hover:shadow-card"><SanityImage imageData={image} alt={`${project.title} ${index + 1}`} width={500} height={500} className="h-full w-full object-cover transition-transform duration-700 lg:group-hover:scale-110" /></div>)}
                  </div>
                </div>
              )}
            </article>

            <aside className="lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-32">
                <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-card sm:p-7">
                  <div className="pointer-events-none absolute right-0 top-0 size-40 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
                  <h2 className="relative border-b border-border/50 pb-4 font-serif text-xl font-bold text-foreground">{dict.portfolio?.project_info || "Thông tin dự án"}</h2>
                  <dl className="relative mt-6 space-y-6">
                    <div><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><User className="size-4" aria-hidden="true" />{dict.portfolio?.client_label || "Khách hàng"}</dt><dd className="mt-2 text-lg font-bold text-foreground">{project.client || "—"}</dd></div>
                    <div><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Calendar className="size-4" aria-hidden="true" />{dict.portfolio?.year_label || "Năm thực hiện"}</dt><dd className="mt-2 text-lg font-bold text-foreground">{project.projectYear || "—"}</dd></div>
                    {project.serviceCategory?.title && project.serviceCategory?.slug && (
                      <div><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Tag className="size-4" aria-hidden="true" />{dict.portfolio?.service_label || "Dịch vụ"}</dt><dd className="mt-2"><Link href={`/${lang}/services/${project.serviceCategory.slug}`} className="inline-flex min-h-11 items-center gap-1 text-lg font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{project.serviceCategory.title}<ChevronRight className="size-4 transition-transform lg:group-hover:translate-x-1" aria-hidden="true" /></Link></dd></div>
                    )}
                  </dl>
                  <Link href={`/${lang}/contact`} className="relative mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-brand transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hover:scale-[1.03]">{dict.common?.contact_btn || "Liên hệ tư vấn"}</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Suspense fallback={<RelatedProjectsSkeleton />}>
        <RelatedProjects project={project} lang={lang} dict={dict} />
      </Suspense>
    </main>
  )
}
