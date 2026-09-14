"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CatalogFilterItem {
  id: string
  label: string
}

interface CatalogSidebarProps {
  items: CatalogFilterItem[]
  activeId: string
  onChange: (id: string) => void
  ariaLabel?: string
}

export function CatalogSidebar({ items, activeId, onChange, ariaLabel = "Filters" }: CatalogSidebarProps) {
  const buttonClass = (active: boolean, mobile = false) =>
    cn(
      "flex min-h-11 items-center gap-2 rounded-xl border text-left text-xs font-semibold transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      mobile ? "shrink-0 snap-start rounded-full px-4 py-2" : "w-full px-3",
      active
        ? "border-primary bg-primary text-primary-foreground shadow-brand"
        : "border-border/70 bg-card text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
    )

  const renderItems = (mobile = false) =>
    items.map((item) => {
      const active = activeId === item.id

      return (
        <button
          key={item.id}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(item.id)}
          className={buttonClass(active, mobile)}
        >
          {!mobile && (
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                active ? "bg-primary-foreground" : "bg-primary/50",
              )}
              aria-hidden="true"
            />
          )}
          <span className={cn("min-w-0", mobile ? "truncate" : "line-clamp-2 leading-4")}>
            {item.label}
          </span>
          {!mobile && (
            <ChevronRight
              className={cn(
                "ml-auto size-4 shrink-0",
                active ? "text-primary-foreground" : "text-muted-foreground",
              )}
              aria-hidden="true"
            />
          )}
        </button>
      )
    })

  return (
    <>
      <aside className="hidden w-56 shrink-0 lg:block" aria-label={ariaLabel}>
        <div className="sticky top-24 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-card backdrop-blur-xl">
          <nav className="space-y-1" aria-label={ariaLabel}>
            {renderItems()}
          </nav>
        </div>
      </aside>

      <div className="relative -mx-4 mb-6 lg:hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />
        <nav
          data-swipe-zone="horizontal"
          className="flex snap-x gap-2 overflow-x-auto px-4 pb-1 no-scrollbar"
          aria-label={ariaLabel}
        >
          {renderItems(true)}
        </nav>
      </div>
    </>
  )
}
