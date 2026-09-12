import { notFound } from "next/navigation"
import { getDictionary } from "@/lib/get-dictionary"
import { PortableText } from "@portabletext/react"
import { Clock, ShieldCheck } from "lucide-react"
import { NutQuayLai } from "@/components/nut-quay-lai"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { sanityClient } from "@/lib/sanity-client"

type LegalDoc = {
  _id: string
  title?: string
  content?: unknown[]
  lastUpdated?: string
  language?: string
  slug?: string
}

function cleanLegalSlug(value: unknown) {
  if (typeof value !== "string") return ""
  return value.split("/").filter(Boolean).pop() || ""
}

async function getLegalDoc(slug: string, lang: string): Promise<LegalDoc | null> {
  const requestedSlug = cleanLegalSlug(slug)

  const docs: LegalDoc[] = await sanityClient.fetch(`
    *[_type == "legalDoc" && defined(slug.current) && !(_id in path("drafts.**"))] {
      _id,
      title,
      content,
      lastUpdated,
      language,
      "slug": slug.current
    }
  `)

  const matchingDocs = docs.filter((doc) => cleanLegalSlug(doc.slug) === requestedSlug)
  if (matchingDocs.length === 0) return null

  return (
    matchingDocs.find((doc) => doc.language === lang) ||
    matchingDocs.find((doc) => doc.language === "en") ||
    matchingDocs.find((doc) => doc.language === "vi") ||
    matchingDocs[0]
  )
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const [doc, siteName] = await Promise.all([getLegalDoc(slug, lang), getSiteName()])
  if (!doc) return { title: { absolute: withSiteName("Policy", siteName) } }

  const cleanSlug = cleanLegalSlug(doc.slug) || cleanLegalSlug(slug)
  const canonicalLang = doc.language || lang

  return {
    title: { absolute: withSiteName(doc.title || "Policy", siteName) },
    alternates: { canonical: `/${canonicalLang}/policy/${cleanSlug}` },
    openGraph: {
      title: withSiteName(doc.title || "Policy", siteName),
      url: `/${canonicalLang}/policy/${cleanSlug}`,
      siteName,
      type: "article",
    },
  }
}

export default async function PolicyPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const [dict, doc] = await Promise.all([getDictionary(lang), getLegalDoc(slug, lang)])

  if (!doc) notFound()

  const locale =
    lang === "vi"
      ? "vi-VN"
      : lang === "jp"
        ? "ja-JP"
        : lang === "kr"
          ? "ko-KR"
          : lang === "cn"
            ? "zh-CN"
            : "en-US"

  const updated = doc.lastUpdated
    ? new Date(doc.lastUpdated).toLocaleDateString(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="container mx-auto px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        <NutQuayLai nhanHienThi={dict.common?.back || (lang === "vi" ? "Quay lại" : "Back")} ngonNgu={lang} />

        <article className="mx-auto mt-10 max-w-4xl">
          <header className="mb-8 sm:mb-10">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {dict.footer?.legal_document || "Legal document"}
            </div>

            <h1 className="mt-5 text-balance font-serif text-4xl font-bold leading-tight sm:text-5xl">
              {doc.title || "Policy"}
            </h1>

            {updated && (
              <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 text-primary" aria-hidden="true" />
                {dict.footer?.last_updated || "Last updated"}: {updated}
              </div>
            )}
          </header>

          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-card sm:p-8 lg:p-10">
            <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-primary prose-p:leading-8">
              <PortableText value={Array.isArray(doc.content) ? doc.content : []} />
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
