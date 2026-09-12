"use client"

import { motion, useInView, useReducedMotion } from "framer-motion"
import { useMemo, useRef } from "react"
import { ArrowRight, CheckCircle2, Award, Target, Zap, Cog } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AboutSummary({ lang, dict, siteName = "COMPANY" }: { lang: string; dict: any; siteName?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px", amount: 0.2 })
  const shouldReduceMotion = useReducedMotion()

  const aboutData = dict?.about_page || {}
  const summaryData = dict?.about_summary || {}
  const serviceData = dict?.services?.cnc || {}
  const heroStats = dict?.hero?.stats || {}
  const common = dict?.common || {}
  const nav = dict?.navigation || {}
  const hasCompanyAboutContent = Boolean(
    aboutData.header_desc || aboutData.header_subtitle || summaryData.description || serviceData.title,
  )

  const particles = useMemo(
    () =>
      Array.from({ length: 120 }, (_, index) => {
        const palette = ["#f97316", "#00f2ff", "#fb923c", "#67e8f9"]
        return {
          id: index,
          color: palette[index % palette.length],
          size: 0.8 + ((index * 7) % 18) / 10,
          left: 4 + ((index * 37) % 92),
          top: 4 + ((index * 53) % 92),
          duration: 2.8 + ((index * 11) % 36) / 10,
          delay: ((index * 13) % 50) / 10,
          driftX: ((index % 7) - 3) * 3,
          driftY: (((index * 3) % 7) - 3) * 3,
        }
      }),
    [],
  )

  const features = hasCompanyAboutContent
    ? [
        {
          icon: Target,
          title: serviceData.title || summaryData.feature2_title || (lang === "vi" ? "Năng lực kỹ thuật" : "Engineering capability"),
          desc: summaryData.feature2_desc || (lang === "vi" ? "Thông tin năng lực theo dữ liệu doanh nghiệp." : "Capability information from company data."),
        },
        {
          icon: Award,
          title: aboutData.quality_title || summaryData.feature1_title || (lang === "vi" ? "Chất lượng" : "Quality"),
          desc: aboutData.quality_desc || summaryData.feature1_desc || (lang === "vi" ? "Quy trình kiểm soát chất lượng." : "Quality control process."),
        },
        {
          icon: Zap,
          title: summaryData.feature3_title || (lang === "vi" ? "Công nghệ" : "Technology"),
          desc: summaryData.feature3_desc || (lang === "vi" ? "Giải pháp kỹ thuật phù hợp nhu cầu." : "Engineering solutions for business needs."),
        },
        {
          icon: CheckCircle2,
          title: lang === "vi" ? "Triển khai" : "Delivery",
          desc: lang === "vi" ? "Quy trình thực hiện theo dữ liệu và năng lực doanh nghiệp." : "Execution based on company capability and process.",
        },
      ]
    : []

  const tags = hasCompanyAboutContent
    ? [
        { icon: Award, label: aboutData.quality_title || "Quality", position: "right-0 top-[10%]", axis: "y" as const, distance: -9, duration: 4.4 },
        { icon: CheckCircle2, label: serviceData.short_title || serviceData.title || "Engineering", position: "-left-2 bottom-[28%]", axis: "y" as const, distance: 10, duration: 5.2 },
        { icon: Cog, label: lang === "vi" ? "Năng lực kỹ thuật" : "Technical capability", position: "right-[8%] bottom-[8%]", axis: "x" as const, distance: 8, duration: 5.8 },
      ]
    : []

  return (
    <section aria-labelledby="about-summary-title" className="relative overflow-hidden border-t border-border/60 bg-card/35 py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-30" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`grid items-center gap-14 ${hasCompanyAboutContent ? "lg:grid-cols-2 lg:gap-20" : "mx-auto max-w-3xl"}`}>
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
            animate={shouldReduceMotion || isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-5 inline-flex min-h-10 items-center rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {nav.about || (lang === "vi" ? "Giới thiệu" : "About Us")}
            </div>

            <h2 id="about-summary-title" className="max-w-2xl text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              <span className="text-primary">{siteName}</span>{" "}
              {hasCompanyAboutContent ? `— ${aboutData.header_subtitle || summaryData.title_highlight || (lang === "vi" ? "Giới thiệu doanh nghiệp" : "Company overview")}` : ""}
            </h2>

            <p className="mt-5 max-w-[62ch] text-base leading-7 text-muted-foreground sm:text-lg">
              {aboutData.header_desc || summaryData.description || (lang === "vi" ? "Thông tin doanh nghiệp đang được cập nhật." : "Company information is being updated.")}
            </p>

            {features.length > 0 ? (
              <ul className="mt-9 grid gap-4 sm:grid-cols-2" role="list">
                {features.map((feature) => (
                  <li key={feature.title} className="group flex min-h-24 gap-3 rounded-2xl border border-border/80 bg-background/75 p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-300 lg:hover:-translate-y-1 lg:hover:border-primary/40 lg:hover:shadow-card">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 lg:group-hover:scale-110">
                      <feature.icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-6 text-foreground">{feature.title}</h3>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">{feature.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            <Button asChild className="mt-9 min-h-12 rounded-full bg-primary px-7 font-semibold text-primary-foreground shadow-soft transition-[background-color,box-shadow,transform] duration-300 lg:hover:-translate-y-1 lg:hover:scale-[1.03] hover:bg-primary/90 hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Link href={`/${lang}/about`} className="flex items-center gap-2">
                {common.read_more || (lang === "vi" ? "Xem chi tiết" : "Read More")}
                <ArrowRight className="size-4 transition-transform duration-300 lg:group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>

          {hasCompanyAboutContent ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion || isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="relative mx-auto flex w-full max-w-[520px] items-center justify-center py-8"
              aria-label={lang === "vi" ? `Năng lực chính của ${siteName}` : `${siteName} capabilities`}
            >
              <div className="relative aspect-square w-full max-w-[480px]">
                <div className="absolute inset-0 rounded-full border border-primary/15 bg-primary/[0.03]" aria-hidden="true" />
                <div className="absolute inset-[12%] rounded-full border border-border/80" aria-hidden="true" />
                <div className="absolute inset-[24%] rounded-full border border-dashed border-primary/25" aria-hidden="true" />

                {!shouldReduceMotion && (
                  <motion.div className="pointer-events-none absolute inset-[2%] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 42, repeat: Infinity, ease: "linear" }} aria-hidden="true">
                    {particles.map((particle) => (
                      <motion.span
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{ width: particle.size, height: particle.size, left: `${particle.left}%`, top: `${particle.top}%`, backgroundColor: particle.color, boxShadow: `0 0 8px ${particle.color}, 0 0 14px ${particle.color}66` }}
                        animate={{ opacity: [0.16, 1, 0.22], x: [0, particle.driftX, 0], y: [0, particle.driftY, 0], scale: [0.72, 1.3, 0.78] }}
                        transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ))}
                  </motion.div>
                )}

                <motion.div className="absolute inset-[30%] z-10 flex flex-col items-center justify-center rounded-full border border-border bg-background/95 px-6 text-center shadow-card" animate={shouldReduceMotion ? undefined : { scale: [1, 1.025, 1] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="font-serif text-2xl font-bold leading-none tracking-tight text-primary sm:text-3xl lg:text-4xl">{siteName}</div>
                  <div className="mt-3 max-w-32 text-xs font-semibold uppercase leading-5 tracking-[0.14em] text-muted-foreground sm:text-sm">
                    {heroStats.experience || summaryData.exp_label || (lang === "vi" ? "Năng lực doanh nghiệp" : "Company capability")}
                  </div>
                </motion.div>

                {tags.map((tag, index) => {
                  const animation = tag.axis === "x" ? { x: [0, tag.distance, 0] } : { y: [0, tag.distance, 0] }
                  return (
                    <motion.div key={tag.label} className={`absolute ${tag.position} z-20 flex min-h-11 items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-xs font-semibold text-foreground shadow-soft backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 sm:text-sm lg:hover:scale-105 lg:hover:border-primary/40 lg:hover:shadow-card`} animate={shouldReduceMotion ? undefined : animation} transition={{ duration: tag.duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 }}>
                      <tag.icon className="size-4 text-primary" aria-hidden="true" />
                      <span>{tag.label}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
