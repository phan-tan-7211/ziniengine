"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const legacyFallbackProjects = [
  {
    id: 1,
    title: "Khuôn dập chi tiết ô tô",
    category: "Khuôn mẫu",
    client: "Toyota Boshoku",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
  },
  {
    id: 2,
    title: "Gia công CNC linh kiện máy bay",
    category: "CNC",
    client: "Vietnam Airlines Technical",
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&q=80",
  },
  {
    id: 3,
    title: "Hệ thống tự động hóa nhà máy",
    category: "Tự động hóa",
    client: "Samsung Electronics",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  },
]

function ProjectCard({ project, index, btnText, lang }: { project: any; index: number; btnText: string; lang: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const shouldReduceMotion = useReducedMotion()
  const href = project.slug ? `/${lang}/portfolio/${project.slug}` : `/${lang}/portfolio`

  return (
    <motion.article
      ref={ref}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : Math.min(index * 0.07, 0.21) }}
      className="group h-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-500 lg:hover:-translate-y-2 lg:hover:scale-[1.015] lg:hover:border-primary/40 lg:hover:shadow-card"
    >
      <Link
        href={href}
        className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`${btnText}: ${project.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={project.image || project.imageUrl || "/placeholder.svg"}
            alt={project.title || ""}
            fill
            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out lg:group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-500 lg:group-hover:opacity-90" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100" aria-hidden="true">
            <div className="absolute -right-16 -top-16 size-44 rounded-full bg-primary/25 blur-3xl" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 transition-transform duration-500 sm:p-6 lg:group-hover:-translate-y-1">
            {project.client && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">
                {project.client}
              </p>
            )}
            <h3 className="text-balance font-serif text-lg font-bold leading-snug text-white sm:text-xl">{project.title}</h3>
            <p className="mt-2 text-sm font-medium text-white/80">{project.category || project.categoryName}</p>
          </div>
        </div>

        <div className="flex min-h-14 items-center justify-between gap-4 border-t border-border/70 px-5 py-3 text-sm font-semibold text-foreground sm:px-6">
          <span>{btnText}</span>
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-[background-color,color,transform] duration-300 lg:group-hover:scale-110 lg:group-hover:bg-primary lg:group-hover:text-primary-foreground" aria-hidden="true">
            <ArrowRight className="size-4 transition-transform duration-300 lg:group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

export function FeaturedProjects({
  dict,
  projects = [],
  lang,
  allowLegacyFallback = false,
}: {
  dict?: any
  projects?: any[]
  lang: string
  allowLegacyFallback?: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const shouldReduceMotion = useReducedMotion()
  const data = dict?.featured_projects || dict?.portfolio || {}
  const displayProjects = projects.length > 0 ? projects : allowLegacyFallback ? legacyFallbackProjects : []

  const autoplay = useRef(
    Autoplay({
      delay: 3400,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    }),
  )

  return (
    <section id="projects" aria-labelledby="featured-projects-title" className="relative overflow-hidden bg-background py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-72 max-w-5xl rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />

      <div ref={ref} className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col gap-7 md:mb-12 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-primary sm:w-12" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{data.badge || "Dự án"}</span>
            </div>

            <h2 id="featured-projects-title" className="max-w-xl text-balance font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {data.title_main || "Dự án"} <span className="text-primary">{data.title_highlight || "nổi bật"}</span>
            </h2>

            <p className="mt-5 max-w-[65ch] text-base leading-7 text-muted-foreground sm:text-lg">
              {data.description || "Các dự án và năng lực tiêu biểu của doanh nghiệp."}
            </p>
          </div>

          <Button asChild variant="outline" className="group min-h-12 w-fit rounded-full border-primary/40 bg-background/70 px-6 text-base font-semibold text-primary shadow-sm transition-[background-color,color,transform] duration-300 lg:hover:-translate-y-1 lg:hover:scale-[1.03] hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Link href={`/${lang}/portfolio`}>
              {data.view_all || "Xem tất cả"}
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 lg:group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>

        {displayProjects.length > 0 ? (
          <Carousel
            data-swipe-zone="horizontal"
            opts={{ align: "start", loop: true }}
            plugins={shouldReduceMotion ? [] : [autoplay.current]}
            className="w-full"
            aria-label={data.badge || "Dự án"}
          >
            <CarouselContent className="-ml-4">
              {displayProjects.map((project, index) => (
                <CarouselItem key={project.id || project.slug || index} className="pl-4 basis-[88%] sm:basis-[72%] md:basis-[48%] lg:basis-1/3">
                  <ProjectCard project={project} index={index} btnText={data.view_details || "Xem chi tiết"} lang={lang} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-6 flex justify-end gap-3">
              <CarouselPrevious className="static size-11 translate-y-0 border-border bg-background shadow-sm hover:border-primary/30 hover:bg-primary/10" />
              <CarouselNext className="static size-11 translate-y-0 border-border bg-background shadow-sm hover:border-primary/30 hover:bg-primary/10" />
            </div>
          </Carousel>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
            {data.empty || "Đang cập nhật dự án."}
          </div>
        )}
      </div>
    </section>
  )
}
