"use client"

import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { DynamicIcon } from "./ui/dynamic-icon"
import { FallbackBadge } from "./fallback-badge"
import { SmartPrefetchLink } from "./smart-prefetch-link"
import { cn } from "@/lib/utils"
import { CatalogSidebar, type CatalogFilterItem } from "./catalog-sidebar"

interface ServiceListContentProps {
  danhSachDichVu: any[]
  lang: string
  dict: any
}

const localCopy: Record<string, { all: string; empty: string }> = {
  vi: { all: 'Tất cả', empty: 'Không có dịch vụ phù hợp với bộ lọc này.' },
  en: { all: 'All', empty: 'No services match this filter.' },
  jp: { all: 'すべて', empty: 'この条件に一致するサービスはありません。' },
  kr: { all: '전체', empty: '이 조건에 맞는 서비스가 없습니다.' },
  cn: { all: '全部', empty: '没有符合此筛选条件的服务。' },
}

export function ServiceListContent({ danhSachDichVu, lang, dict }: ServiceListContentProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const copy = localCopy[lang] || localCopy.en

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    danhSachDichVu.forEach((service) => {
      if (!Array.isArray(service.tags)) return
      service.tags.forEach((tag: unknown) => {
        if (typeof tag === "string" && tag.trim()) tags.add(tag.trim())
      })
    })
    return Array.from(tags)
  }, [danhSachDichVu])

  const filteredServices = useMemo(() => {
    if (!activeTag) return danhSachDichVu
    return danhSachDichVu.filter((service) => Array.isArray(service.tags) && service.tags.includes(activeTag))
  }, [activeTag, danhSachDichVu])

  const filterItems: CatalogFilterItem[] = [
    { id: "all", label: copy.all },
    ...allTags.map((tag) => ({ id: tag, label: tag })),
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-start gap-4 lg:gap-6">
        <CatalogSidebar
          items={filterItems}
          activeId={activeTag || "all"}
          onChange={(id) => setActiveTag(id === "all" ? null : id)}
          ariaLabel={dict.navigation?.services}
        />
        <div className="min-w-0 flex-1">
      <motion.div layout={!shouldReduceMotion} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredServices.map((service: any, index: number) => (
            <motion.article key={service._id || service.slug} layout={!shouldReduceMotion} initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={shouldReduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, delay: Math.min(index * 0.035, 0.18) }} className="h-full">
              <SmartPrefetchLink href={`/${lang}/services/${service.slug}`} className={cn("group relative flex h-full min-h-[230px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-card p-5 shadow-card transition-all duration-300", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", "lg:hover:-translate-y-2 lg:hover:scale-[1.015] lg:hover:border-primary/45 lg:hover:shadow-brand")}>
                <FallbackBadge ngonNguThucTe={service.language} ngonNguNguoiDung={lang} />
                <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10"><DynamicIcon iconData={service.icon} className="size-6 text-primary" /></div>
                  <ArrowRight className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="relative z-10 flex flex-1 flex-col">
                  <h2 className="text-balance text-lg font-semibold leading-snug text-foreground">{service.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{service.description}</p>
                  {Array.isArray(service.tags) && service.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{service.tags.slice(0, 2).map((tag: string) => <span key={tag} className="rounded-full border border-border/70 bg-secondary/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">{tag}</span>)}</div>}
                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-primary">{dict.services?.read_more || dict.common?.read_more}<ArrowRight className="size-4" aria-hidden="true" /></span>
                </div>
              </SmartPrefetchLink>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {filteredServices.length === 0 && (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <p className="text-base font-medium text-foreground">{dict.services?.no_results || copy.empty}</p>
          <button type="button" onClick={() => setActiveTag(null)} className="mt-4 min-h-11 rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary">{copy.all}</button>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
