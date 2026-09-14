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
      mobile ? "w-full px-3 py-2" : "w-full px-3",
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
          <span className={cn("min-w-0", "line-clamp-2 leading-4")}>
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
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border/70 bg-card/95 p-2 shadow-card backdrop-blur-xl">
          <nav className="space-y-1" aria-label={ariaLabel}>
            {renderItems()}
          </nav>
        </div>
      </aside>

      <div className="mb-6 lg:hidden">
        <nav
          data-swipe-zone="horizontal"
          className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1"
          aria-label={ariaLabel}
        >
          {renderItems(true)}
        </nav>
      </div>
    </>
  )
}
