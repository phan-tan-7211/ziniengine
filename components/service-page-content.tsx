"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { motion, useInView, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, CheckCircle2, ChevronRight, Home, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DetailCollectionLink } from "@/components/detail-collection-link"
import { DynamicIcon } from "./ui/dynamic-icon"
import { useSiteSettings } from "@/components/site-settings-context"

interface ThongSoKyThuat { label: string; value: string }
interface BuocQuyTrinh { step: number | string; title: string; description: string }
interface BanDichTuongUng { language: string; slug: string }
interface Service {
  _id: string
  title: string
  shortTitle?: string
  slug: string
  description: string
  icon: any
  image?: string
  tags: string[]
  features: string[]
  specs: ThongSoKyThuat[]
  process: BuocQuyTrinh[]
  labels?: { featuresTitle?: string; specsTitle?: string; processTitle?: string; relatedTitle?: string }
  banDichTuongUng?: BanDichTuongUng[]
}
interface RelatedService {
  _id: string
  title: string
  slug: string
  description: string
  icon: any
}
interface ServicePageContentProps { service: Service; relatedServices?: RelatedService[] | null; lang: string; dict: any }

export function ServicePageContent({ service, relatedServices, lang, dict }: ServicePageContentProps) {
  const { phoneTel } = useSiteSettings()
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: "-80px" })
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (service.banDichTuongUng?.length) {
      const map: Record<string, string> = {}
      service.banDichTuongUng.forEach((translation) => { map[translation.language] = translation.slug })
      ;(window as any).zinitekTranslations = map
    }
    return () => { delete (window as any).zinitekTranslations }
  }, [service.banDichTuongUng])

  const reveal = (delay = 0, distance = 20) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.55, delay },
  })
  const inViewMotion = (delay = 0, x = 0, y = 24) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, x, y },
    animate: inView ? { opacity: 1, x: 0, y: 0 } : {},
    transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.55, delay },
  })

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border/60 bg-background pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.025] via-transparent to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl sm:h-96 sm:w-96" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-35 dark:opacity-55" aria-hidden="true" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.nav
            {...reveal(0, 12)}
            className="mb-7 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 text-sm sm:mb-8"
            aria-label="Breadcrumb"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Home className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Link href={`/${lang}`} className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {dict?.common?.home || "Trang chủ"}
              </Link>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
              <Link href={`/${lang}/services`} className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {dict?.navigation?.services || "Dịch vụ"}
              </Link>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
              <span className="max-w-[70vw] truncate font-medium text-primary" aria-current="page" title={service.shortTitle || service.title}>
                {service.shortTitle || service.title}
              </span>
            </div>
          </motion.nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <div className="max-w-3xl">
              <motion.div {...reveal(0.06, 14)} className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <DynamicIcon iconData={service.icon} className="size-4" />
                {dict?.services?.badge || dict?.navigation?.services || "Dịch vụ"}
              </motion.div>
              <motion.h1 {...reveal(0.12, 22)} className="text-balance font-serif text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">{service.title}</motion.h1>
              <motion.p {...reveal(0.18, 22)} className="mt-5 max-w-[62ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{service.description}</motion.p>
              {service.tags.length > 0 && (
                <motion.div {...reveal(0.24, 18)} className="mt-7 flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => <span key={`${tag}-${index}`} className="rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-sm text-muted-foreground shadow-soft">{tag}</span>)}
                </motion.div>
              )}
              <motion.div {...reveal(0.3, 18)} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-h-12 bg-primary font-semibold text-primary-foreground shadow-brand transition-transform lg:hover:scale-[1.04]">
                  <Link href={`/${lang}/contact`}>{dict?.services?.request_quote || "Yêu cầu báo giá"}<ArrowRight className="ml-2 size-5" aria-hidden="true" /></Link>
                </Button>
                {phoneTel && (
                  <Button asChild variant="outline" size="lg" className="min-h-12 bg-background/70 transition-all hover:border-primary/40 hover:text-primary">
                    <a href={`tel:${phoneTel}`}><Phone className="mr-2 size-5" aria-hidden="true" />{dict?.services?.call_now || "Gọi ngay"}</a>
                  </Button>
                )}
              </motion.div>
            </div>

            <motion.div initial={shouldReduceMotion ? false : { opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.18 }} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-primary/30 bg-card shadow-card">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 lg:hover:scale-[1.035]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" aria-hidden="true" />
              </div>
            </motion.div>
          </div>
        </div>
        <div className="pointer-events-none absolute left-8 top-32 hidden size-24 border-l border-t border-primary/20 lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-8 right-8 hidden size-24 border-b border-r border-border/70 lg:block" aria-hidden="true" />
      </section>

      <section ref={sectionRef} className="section-space relative bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div {...inViewMotion(0, -24, 0)}>
              <h2 className="mb-7 font-serif text-2xl font-bold text-foreground sm:text-3xl">{service.labels?.featuresTitle || "Tính năng nổi bật"}</h2>
              {service.features.length > 0 ? (
                <ul className="space-y-3">
                  {service.features.map((feature, index) => (
                    <motion.li key={`feature-${index}`} initial={shouldReduceMotion ? false : { opacity: 0, x: -14 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.07 }} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-soft transition-all lg:hover:-translate-y-0.5 lg:hover:border-primary/30 lg:hover:shadow-card">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><span className="leading-7 text-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground">—</p>}
            </motion.div>

            <motion.div {...inViewMotion(0.08, 24, 0)}>
              <h2 className="mb-7 font-serif text-2xl font-bold text-foreground sm:text-3xl">{service.labels?.specsTitle || "Thông số kỹ thuật"}</h2>
              {service.specs.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {service.specs.map((spec, index) => <div key={`spec-${index}`} className="rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-all lg:hover:-translate-y-0.5 lg:hover:border-primary/30 lg:hover:shadow-card"><div className="font-serif text-2xl font-bold text-primary">{spec.value}</div><div className="mt-1 text-sm leading-6 text-muted-foreground">{spec.label}</div></div>)}
                </div>
              ) : <p className="text-muted-foreground">—</p>}
            </motion.div>
          </div>
        </div>
      </section>

      {service.process.length > 0 && (
        <section className="section-space relative border-y border-border/50 bg-muted/25">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">{service.labels?.processTitle || "Quy trình làm việc"}</h2>
              <p className="mt-4 leading-7 text-muted-foreground">{dict?.services?.process_description || "Quy trình chuyên nghiệp đảm bảo chất lượng và tiến độ cho mọi dự án."}</p>
            </div>
            <div className="relative mx-auto max-w-5xl">
              <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-primary via-primary/40 to-transparent lg:block" aria-hidden="true" />
              <div className="space-y-6 lg:space-y-0">
                {service.process.map((step, index) => (
                  <motion.div key={`step-${index}`} initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.08 }} className={`relative lg:flex lg:items-center lg:gap-12 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                    <div className={`lg:w-1/2 ${index % 2 === 0 ? "lg:pr-12" : "lg:pl-12"}`}>
                      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all lg:hover:-translate-y-1 lg:hover:border-primary/30 lg:hover:shadow-card">
                        <div className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary lg:hidden">{step.step}</div>
                        <h3 className="font-serif text-xl font-bold text-foreground">{step.title}</h3><p className="mt-2 leading-7 text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 hidden size-11 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary bg-background font-bold text-primary shadow-soft lg:flex">{step.step}</div><div className="hidden lg:block lg:w-1/2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {relatedServices && relatedServices.length > 0 && (
        <section className="section-space bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{dict?.navigation?.services || "Dịch vụ"}</p><h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">{service.labels?.relatedTitle || "Dịch vụ liên quan"}</h2></div>
              <DetailCollectionLink href={`/${lang}/services`} label={dict?.navigation?.view_all_services || "Xem tất cả dịch vụ kỹ thuật"} />
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((related, index) => (
                <motion.div key={`related-${related.slug}-${index}`} initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, delay: index * 0.07 }}>
                  <Link href={`/${lang}/services/${related.slug}`} className="group flex h-full min-h-44 flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hover:-translate-y-2 lg:hover:scale-[1.015] lg:hover:border-primary/35 lg:hover:shadow-card">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all lg:group-hover:rotate-6 lg:group-hover:scale-110 lg:group-hover:bg-primary lg:group-hover:text-primary-foreground"><DynamicIcon iconData={related.icon} className="size-6" /></div>
                    <h3 className="font-serif text-lg font-bold text-foreground transition-colors lg:group-hover:text-primary">{related.title}</h3><p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">{related.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">{dict?.services?.read_more || "Tìm hiểu thêm"}<ArrowRight className="size-4 transition-transform lg:group-hover:translate-x-1.5" aria-hidden="true" /></span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedServices && relatedServices.length === 0 && (
        <section className="border-t border-border/50 bg-background py-10 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <DetailCollectionLink href={`/${lang}/services`} label={dict?.navigation?.view_all_services || "Xem tất cả dịch vụ kỹ thuật"} />
          </div>
        </section>
      )}

      <section className="pb-20 sm:pb-24 lg:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-card p-7 shadow-card sm:p-10">
            <div className="pointer-events-none absolute right-0 top-0 size-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl"><h2 className="text-balance font-serif text-2xl font-bold text-foreground sm:text-3xl">{dict?.services?.request_consult || "Bạn cần tư vấn cho dịch vụ này?"}</h2><p className="mt-3 leading-7 text-muted-foreground">{service.shortTitle || service.title}</p></div>
              <Button asChild size="lg" className="min-h-12 shrink-0 bg-primary font-semibold text-primary-foreground shadow-brand transition-transform lg:hover:scale-105"><Link href={`/${lang}/contact`}>{dict?.common?.contact_btn || "Liên hệ tư vấn"}<ArrowRight className="ml-2 size-5" aria-hidden="true" /></Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
