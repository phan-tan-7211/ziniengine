"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, Star } from "lucide-react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { sanityCdnClient } from "@/lib/sanity-client"

interface SanityReview {
  _key?: string
  author?: string
  rating?: number
  content?: string | Record<string, string>
  meta?: string
  reviewUrl?: string
}

interface ReviewSettings {
  enabled?: boolean
  badge?: Record<string, string>
  titlePart1?: Record<string, string>
  titleHighlight?: Record<string, string>
  description?: Record<string, string>
  reviewsLabel?: Record<string, string>
  viewGoogleLabel?: Record<string, string>
  googleRating?: number
  googleReviewCount?: number
  googleMapsUrl?: string
  googleReviews?: SanityReview[]
}

interface TrustedCompany {
  _key?: string
  name?: string
  url?: string
  enabled?: boolean
}

interface TrustedCompaniesSettings {
  enabled?: boolean
  heading?: Record<string, string>
  companies?: TrustedCompany[]
}

interface TestimonialsSectionProps {
  dict: any
  lang?: string
}

const uiText: Record<string, Record<string, string>> = {
  vi: { reviews: "đánh giá trên Google", viewGoogle: "Xem trên Google", trustedBy: "Được tin tưởng bởi các doanh nghiệp hàng đầu" },
  en: { reviews: "reviews on Google", viewGoogle: "View on Google", trustedBy: "Trusted by leading companies" },
  jp: { reviews: "Google のクチコミ", viewGoogle: "Googleで見る", trustedBy: "主要企業からの信頼" },
  kr: { reviews: "Google 리뷰", viewGoogle: "Google에서 보기", trustedBy: "주요 기업이 신뢰하는 파트너" },
  cn: { reviews: "Google 评价", viewGoogle: "在 Google 上查看", trustedBy: "深受领先企业信赖" },
}

let socialProofPromise: Promise<[ReviewSettings, ReviewSettings, TrustedCompaniesSettings]> | null = null
let socialProofCachedAt = 0
const SOCIAL_PROOF_TTL = 5 * 60 * 1000

function loadSocialProof() {
  if (!socialProofPromise || Date.now() - socialProofCachedAt > SOCIAL_PROOF_TTL) {
    socialProofCachedAt = Date.now()
    socialProofPromise = Promise.all([
      sanityCdnClient.fetch<ReviewSettings>(`*[_type == "googleReviewsSettings" && _id == "googleReviewsSettings" && !(_id in path("drafts.**"))][0]{enabled,badge,titlePart1,titleHighlight,description,reviewsLabel,viewGoogleLabel,googleRating,googleReviewCount,googleMapsUrl,googleReviews[]{_key,author,rating,content,meta,reviewUrl}}`),
      sanityCdnClient.fetch<ReviewSettings>(`*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{googleRating,googleReviewCount,googleMapsUrl,googleReviews[]{_key,author,rating,content,meta,reviewUrl}}`),
      sanityCdnClient.fetch<TrustedCompaniesSettings>(`*[_type == "trustedCompanies" && _id == "trustedCompanies" && !(_id in path("drafts.**"))][0]{enabled,heading,companies[]{_key,name,url,enabled}}`),
    ]).catch((error) => {
      socialProofPromise = null
      throw error
    })
  }
  return socialProofPromise
}

function Stars({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`size-4 ${star <= Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-border"}`} aria-hidden="true" />
      ))}
    </div>
  )
}

function resolveReviewContent(review: SanityReview, lang: string) {
  if (typeof review.content === "string") return review.content
  return review.content?.[lang]?.trim() || review.content?.vi?.trim() || ""
}

function ReviewCard({ review, index, lang }: { review: SanityReview; index: number; lang: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduceMotion = useReducedMotion()
  const content = resolveReviewContent(review, lang)

  return (
    <motion.article ref={ref} initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: index * 0.07 }} className="group flex h-full flex-col rounded-[var(--radius-card)] border border-border/70 bg-card/85 p-5 shadow-soft backdrop-blur-sm transition-all lg:hover:-translate-y-1.5 lg:hover:border-primary/30 lg:hover:shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3"><Stars rating={review.rating || 5} /><span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Google</span></div>
      <p className="flex-1 text-[15px] leading-7 text-foreground">“{content}”</p>
      <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{(review.author || "G").charAt(0)}</div>
        <div className="min-w-0 flex-1"><div className="truncate font-semibold text-foreground">{review.author || "Google user"}</div><div className="text-xs text-muted-foreground">{review.meta || "Google review"}</div></div>
        {review.reviewUrl && <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer nofollow" aria-label="Open review on Google Maps" className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-all hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ExternalLink className="size-4" aria-hidden="true" /></a>}
      </div>
    </motion.article>
  )
}

export function TestimonialsSection({ dict, lang = "vi" }: TestimonialsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const reduceMotion = useReducedMotion()
  const [settings, setSettings] = useState<ReviewSettings | null>(null)
  const [trustedSettings, setTrustedSettings] = useState<TrustedCompaniesSettings | null>(null)
  const labels = uiText[lang] || uiText.vi
  const t = dict?.testimonials || {}

  useEffect(() => {
    let active = true
    loadSocialProof()
      .then(([newReviewData, legacyReviewData, trustedData]) => {
        if (!active) return
        const mergedReviewData: ReviewSettings = {
          ...(legacyReviewData || {}),
          ...(newReviewData || {}),
          googleRating: newReviewData?.googleRating ?? legacyReviewData?.googleRating,
          googleReviewCount: newReviewData?.googleReviewCount ?? legacyReviewData?.googleReviewCount,
          googleMapsUrl: newReviewData?.googleMapsUrl || legacyReviewData?.googleMapsUrl,
          googleReviews: newReviewData?.googleReviews && newReviewData.googleReviews.length > 0 ? newReviewData.googleReviews : legacyReviewData?.googleReviews || [],
        }
        setSettings(mergedReviewData)
        setTrustedSettings(trustedData || {})
      })
      .catch((error) => {
        console.error("Sanity social proof:", error)
        if (!active) return
        setSettings({})
        setTrustedSettings({})
      })
    return () => { active = false }
  }, [])

  const reviews = (settings?.googleReviews || []).filter((review) => resolveReviewContent(review, lang) && review.author)
  const trustedCompanies = (trustedSettings?.companies || []).filter((company) => company.enabled !== false && company.name?.trim())
  const showReviews = settings?.enabled !== false && reviews.length > 0
  const showTrustedCompanies = trustedSettings?.enabled !== false && trustedCompanies.length > 0
  const trustedHeading = trustedSettings?.heading?.[lang]?.trim() || t.trusted_by || labels.trustedBy
  const badge = settings?.badge?.[lang]?.trim() || t.badge || "Google Reviews"
  const titlePart1 = settings?.titlePart1?.[lang]?.trim() || t.title_part1 || "Đối tác"
  const titleHighlight = settings?.titleHighlight?.[lang]?.trim() || t.title_highlight || "tin cậy"
  const description = settings?.description?.[lang]?.trim() || t.description || "Những đánh giá thực tế từ khách hàng và đối tác trên Google."
  const reviewsLabel = settings?.reviewsLabel?.[lang]?.trim() || labels.reviews
  const viewGoogleLabel = settings?.viewGoogleLabel?.[lang]?.trim() || labels.viewGoogle
  const loading = settings === null || trustedSettings === null

  if (!loading && !showReviews && !showTrustedCompanies) return null

  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-secondary/20 py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.045] blur-[140px]" aria-hidden="true" />
      <div ref={ref} className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {(loading || showReviews) && (
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={reduceMotion ? { duration: 0 } : { duration: 0.6 }} className="mx-auto mb-10 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-3"><span className="h-px w-10 bg-gradient-to-r from-transparent to-primary" aria-hidden="true" /><span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{badge}</span><span className="h-px w-10 bg-gradient-to-l from-transparent to-primary" aria-hidden="true" /></div>
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">{titlePart1} <span className="italic text-primary">{titleHighlight}</span></h2>
            <p className="mx-auto mt-4 max-w-[65ch] text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
            {settings && (settings.googleRating || settings.googleReviewCount || settings.googleMapsUrl) && (
              <div className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-border/70 bg-background/90 px-4 py-2.5 shadow-soft">
                <Stars rating={settings.googleRating || 0} />
                {typeof settings.googleRating === "number" && <strong className="text-lg text-foreground">{settings.googleRating.toFixed(1)}</strong>}
                {typeof settings.googleReviewCount === "number" && <span className="text-sm text-muted-foreground">· {settings.googleReviewCount} {reviewsLabel}</span>}
                {settings.googleMapsUrl && <a href={settings.googleMapsUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{viewGoogleLabel}<ExternalLink className="size-3.5" aria-hidden="true" /></a>}
              </div>
            )}
          </motion.div>
        )}

        {loading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-[var(--radius-card)] border border-border/60 bg-card/60" />)}</div> : showReviews ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{reviews.map((review, index) => <ReviewCard key={review._key || `${review.author}-${index}`} review={review} index={index} lang={lang} />)}</div> : null}

        {showTrustedCompanies && (
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.15 }} className={`${showReviews ? "mt-16" : "mt-0"} border-t border-border/60 pt-10 sm:pt-12`}>
            <p className="mb-7 text-center text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">{trustedHeading}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 opacity-70 sm:gap-x-12 lg:gap-x-16">
              {trustedCompanies.map((company, index) => {
                const key = company._key || `${company.name}-${index}`
                const className = "font-serif text-lg font-bold text-foreground/70 transition-colors hover:text-primary sm:text-xl"
                return company.url ? <a key={key} href={company.url} target="_blank" rel="noopener noreferrer" className={className}>{company.name}</a> : <span key={key} className={`${className} cursor-default`}>{company.name}</span>
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
