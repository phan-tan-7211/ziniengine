"use client"

import { useEffect, useState } from "react"
import { LazyMotion, domMax, m, useReducedMotion } from "framer-motion"
import { ArrowRight, Play, ChevronDown, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number
  suffix?: string
  prefix?: string
}) {
  const [count, setCount] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(value)
      return
    }

    let frame = 0
    const duration = 1200
    const startTime = performance.now()

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(value * eased)

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [shouldReduceMotion, value])

  const displayValue = value < 1 ? count.toFixed(3) : Math.floor(count)

  return (
    <span className="font-serif text-3xl font-bold tabular-nums text-foreground sm:text-4xl lg:text-5xl">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
}

export function HeroSection({ dict, lang }: { dict: any; lang: string }) {
  const data = dict?.hero || dict
  const shouldReduceMotion = useReducedMotion()

  // These legacy numeric values are shown only when the corresponding company
  // labels exist. A brand-new white-label dataset receives an empty stats object,
  // so it must not inherit ZINITEK's achievements.
  const stats = [
    data?.stats?.projects ? { value: 500, suffix: "+", label: data.stats.projects } : null,
    data?.stats?.experience ? { value: 10, suffix: "+", label: data.stats.experience } : null,
    data?.stats?.quality ? { value: 100, suffix: "%", label: data.stats.quality } : null,
    data?.stats?.experts ? { value: 50, suffix: "+", label: data.stats.experts } : null,
  ].filter(Boolean) as Array<{ value: number; suffix: string; label: string }>

  const reveal = shouldReduceMotion
    ? { initial: false as const, animate: undefined }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

  return (
    <LazyMotion features={domMax}>
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="relative flex min-h-dvh items-center overflow-hidden bg-background py-20 sm:py-24 lg:py-28"
      >
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/70 to-background" />
          <div className="absolute right-[-10%] top-[8%] size-[28rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[5%] left-[-8%] size-[22rem] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <m.div
              {...reveal}
              transition={{ duration: 0.35 }}
              className="mb-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              <span>{data?.badge || "Giải pháp kỹ thuật"}</span>
            </m.div>

            <h1
              id="hero-title"
              className="text-balance font-serif text-4xl font-bold uppercase leading-[1.02] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            >
              <m.span {...reveal} transition={{ duration: 0.4 }} className="block">
                {data?.title_line1 || "Giải pháp"}
              </m.span>
              <m.span
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.12 }}
                className="mt-2 block normal-case text-primary"
              >
                {data?.title_highlight || "kỹ thuật"}
              </m.span>
              <m.span
                {...reveal}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-2 block"
              >
                {data?.title_line2 || "cho doanh nghiệp"}
              </m.span>
            </h1>

            <m.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mx-auto mt-7 max-w-[68ch] text-pretty text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl lg:leading-8"
              dangerouslySetInnerHTML={{
                __html: data?.description || "Website doanh nghiệp.",
              }}
            />

            <m.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26 }}
              className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                asChild
                className="group min-h-12 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-soft transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Link href={`/${lang}/services`}>
                  {data?.cta_primary || "Xem dịch vụ"}
                  <ArrowRight
                    className="ml-2 size-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="min-h-12 rounded-full border-border bg-background/70 px-7 text-base font-semibold text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Link href={`/${lang}/portfolio`}>
                  <Play className="mr-2 size-5 text-primary" aria-hidden="true" />
                  {data?.cta_secondary || "Xem dự án"}
                </Link>
              </Button>
            </m.div>

            {stats.length > 0 && (
              <m.dl
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.34 }}
                className="mt-14 grid grid-cols-2 gap-x-4 gap-y-8 border-t border-border/80 pt-9 md:grid-cols-4 md:gap-6 lg:mt-16 lg:pt-10"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <dd>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </dd>
                    <dt className="mx-auto mt-2 max-w-36 text-xs font-medium uppercase leading-5 tracking-[0.12em] text-muted-foreground sm:text-sm">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </m.dl>
            )}
          </div>

          <div
            className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground lg:flex"
            aria-hidden="true"
          >
            <span className="text-xs uppercase tracking-[0.18em]">
              {data?.scroll_text || "Cuộn xuống"}
            </span>
            <m.div
              animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="size-5 text-primary" />
            </m.div>
          </div>
        </div>
      </section>
    </LazyMotion>
  )
}
