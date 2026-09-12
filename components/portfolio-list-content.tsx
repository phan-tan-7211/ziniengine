"use client"

import { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FallbackBadge } from "./fallback-badge"

interface ThongTinDanhMuc { _id: string; title: string }
interface ThongTinDuAn { _id: string; title: string; client?: string; description?: string; slug: string; language: string; image?: { url: string }; categoryIdentifier?: string }
interface PortfolioListContentProps { projects: ThongTinDuAn[]; categories: ThongTinDanhMuc[]; lang: string; dict: any }

const localCopy: Record<string, { all: string; empty: string }> = {
  vi: { all: 'Tất cả', empty: 'Chưa có dự án trong danh mục này.' },
  en: { all: 'All', empty: 'No projects are available in this category.' },
  jp: { all: 'すべて', empty: 'このカテゴリにはまだプロジェクトがありません。' },
  kr: { all: '전체', empty: '이 카테고리에는 아직 프로젝트가 없습니다.' },
  cn: { all: '全部', empty: '此分类下暂无项目。' },
}

export function PortfolioListContent({ projects, categories, lang, dict }: PortfolioListContentProps) {
  const [activeCategoryId, setActiveCategoryId] = useState("all")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const copy = localCopy[lang] || localCopy.en
  const isDragging = useRef(false)
  const wasDragging = useRef(false)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current
    if (!el) return
    isDragging.current = true
    wasDragging.current = false
    startX.current = event.pageX - el.offsetLeft
    startScrollLeft.current = el.scrollLeft
    el.style.cursor = "grabbing"
    el.style.userSelect = "none"
  }

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollContainerRef.current) return
    event.preventDefault()
    const el = scrollContainerRef.current
    const walk = (event.pageX - el.offsetLeft - startX.current) * 1.35
    if (Math.abs(walk) > 4) wasDragging.current = true
    el.scrollLeft = startScrollLeft.current - walk
  }

  const stopDragging = () => {
    isDragging.current = false
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab"
      scrollContainerRef.current.style.userSelect = ""
    }
  }

  const filteredProjects = useMemo(() => activeCategoryId === "all" ? projects : projects.filter((project) => project.categoryIdentifier === activeCategoryId), [activeCategoryId, projects])
  const allLabel = dict.portfolio?.all_projects || copy.all

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sticky top-0 z-40 -mx-4 mb-8 border-b border-border/40 bg-background/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:relative md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none lg:-mx-0">
        <div className="relative">
          <div ref={scrollContainerRef} data-swipe-zone="horizontal" className="flex cursor-grab snap-x gap-2 overflow-x-auto pb-1 no-scrollbar" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stopDragging} onMouseLeave={() => isDragging.current && stopDragging()}>
            <button type="button" onClick={() => !wasDragging.current && setActiveCategoryId("all")} aria-pressed={activeCategoryId === "all"} className={`min-h-11 flex-shrink-0 snap-start rounded-full border px-5 py-2 text-sm font-semibold transition-all ${activeCategoryId === "all" ? "border-primary bg-primary text-primary-foreground shadow-brand" : "border-border bg-card text-muted-foreground"}`}>{allLabel}</button>
            {categories.map((category) => <button key={category._id} type="button" onClick={() => !wasDragging.current && setActiveCategoryId(category._id)} aria-pressed={activeCategoryId === category._id} className={`min-h-11 flex-shrink-0 snap-start rounded-full border px-5 py-2 text-sm font-semibold transition-all ${activeCategoryId === category._id ? "border-primary bg-primary text-primary-foreground shadow-brand" : "border-border bg-card text-muted-foreground"}`}>{category.title}</button>)}
          </div>
        </div>
      </div>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div key={project._id} layout initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28 }} className="h-full">
              <Link href={`/${lang}/portfolio/${project.slug}`} aria-label={`${dict.common?.read_more}: ${project.title}`} className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-card shadow-soft transition-all duration-300 lg:hover:-translate-y-2 lg:hover:scale-[1.01] lg:hover:border-primary/40 lg:hover:shadow-card">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                  <Image src={project.image?.url || "/placeholder.svg"} alt={project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition-transform duration-700 lg:group-hover:scale-110" />
                  <div className="absolute left-3 top-3 z-20"><FallbackBadge ngonNguThucTe={project.language} ngonNguNguoiDung={lang} /></div>
                  {project.client && <span className="absolute bottom-3 left-3 z-20 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">{project.client}</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-foreground">{project.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">{project.description || "—"}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4"><span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">{dict.common?.read_more}<ArrowRight className="size-4" aria-hidden="true" /></span><Eye className="size-4 text-muted-foreground/60" aria-hidden="true" /></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProjects.length === 0 && <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-card/50 px-6 py-14 text-center"><p className="font-serif text-xl font-bold text-foreground">{dict.portfolio?.empty_title || copy.empty}</p><button type="button" onClick={() => setActiveCategoryId("all")} className="mt-4 min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-primary">{allLabel}</button></div>}
    </div>
  )
}
