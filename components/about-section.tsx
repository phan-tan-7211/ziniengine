"use client"

import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { CheckCircle2, Award, Target, Zap } from "lucide-react"

export function AboutSection({ lang, dict, siteName = "COMPANY" }: { lang: string; dict: any; siteName?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const reduceMotion = useReducedMotion()
  const data = dict?.about_summary || {}
  const aboutPage = dict?.about_page || {}
  const stats = dict?.hero?.stats || {}
  const hasCompanyAboutContent = Boolean(
    data.badge || data.title_main || data.title_highlight || aboutPage.header_desc || aboutPage.description_2 || aboutPage.commitment,
  )

  const features = hasCompanyAboutContent
    ? [
        { icon: Target, title: data.feature2_title || "High Precision", desc: data.feature2_desc || "Precision manufacturing capability" },
        { icon: Award, title: aboutPage.quality_title || "Quality", desc: aboutPage.quality_desc || "Quality management and process control" },
        { icon: Zap, title: data.feature1_title || "Technology", desc: data.feature1_desc || "Modern engineering solutions" },
        { icon: CheckCircle2, title: data.feature3_title || "Delivery", desc: data.feature3_desc || "Reliable project execution" },
      ]
    : []

  const reveal = (x: number, delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, x },
    animate: isInView ? { opacity: 1, x: 0 } : {},
    transition: reduceMotion ? { duration: 0 } : { duration: 0.7, delay },
  })

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-primary/[0.045] to-transparent" aria-hidden="true" />
      <div ref={ref} className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid items-center gap-14 ${hasCompanyAboutContent ? "lg:grid-cols-2 lg:gap-20" : "mx-auto max-w-3xl"}`}>
          <motion.div {...reveal(-40)}>
            <div className="mb-5 inline-flex min-h-10 items-center rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {data.badge || (lang === "vi" ? `Về ${siteName}` : `About ${siteName}`)}
            </div>
            <h2 className="max-w-2xl text-balance font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {data.title_main || aboutPage.header_title || (lang === "vi" ? "Giới thiệu doanh nghiệp" : "Company overview")}{" "}
              {data.title_highlight ? <span className="text-primary">{data.title_highlight}</span> : null}
            </h2>
            <div className="mt-7 max-w-[68ch] space-y-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              <p>{aboutPage.header_desc || (lang === "vi" ? "Thông tin doanh nghiệp đang được cập nhật." : "Company information is being updated.")}</p>
              {aboutPage.description_2 ? <p className="border-l-2 border-primary pl-5 font-medium text-foreground/90">{aboutPage.description_2}</p> : null}
              {aboutPage.commitment ? <p>{aboutPage.commitment}</p> : null}
            </div>

            {features.length > 0 ? (
              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: 0.15 + index * 0.08 }}
                    className="group rounded-2xl border border-border/70 bg-card/70 p-5 shadow-soft transition-all lg:hover:-translate-y-1 lg:hover:border-primary/40 lg:hover:shadow-card"
                  >
                    <feature.icon className="mb-3 size-7 text-primary transition-transform lg:group-hover:scale-110 lg:group-hover:-rotate-3" aria-hidden="true" />
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </motion.div>

          {hasCompanyAboutContent ? (
            <motion.div {...reveal(40, 0.15)} className="relative mx-auto w-full max-w-md">
              <div className="relative aspect-square">
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/25"
                  animate={reduceMotion ? undefined : { rotate: 360 }}
                  transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-5 rounded-full border border-border/70" />
                <div className="absolute inset-10 rounded-full border border-border/50" />
                <div className="absolute inset-14 flex items-center justify-center rounded-full border border-primary/25 bg-card shadow-card">
                  <div className="px-8 text-center">
                    <div className="font-serif text-4xl font-bold text-primary">{siteName}</div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{data.exp_label || stats.experience || (lang === "vi" ? "Năng lực doanh nghiệp" : "Company capability")}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
