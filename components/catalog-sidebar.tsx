import Link from "next/link"
import { ChevronRight, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ServiceItem = {
  slug?: string
  title?: string
  tags?: string[]
}

interface CatalogSidebarProps {
  lang: string
  dict: any
  serviceItems?: ServiceItem[]
}

export function CatalogSidebar({ lang, dict, serviceItems = [] }: CatalogSidebarProps) {
  const services = serviceItems.filter(
    (item): item is ServiceItem & { slug: string; title: string } =>
      Boolean(item.slug && item.title),
  )

  return (
    <aside
      aria-label={dict.catalog_sidebar?.title || dict.navigation?.services || "Technical Services"}
      className="hidden w-56 shrink-0 lg:block"
    >
      <div className="sticky top-24 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-card backdrop-blur-xl">
        <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {dict.catalog_sidebar?.title || dict.navigation?.services || "Technical Services"}
        </div>

        <nav
          className="space-y-1"
          aria-label={dict.catalog_sidebar?.title || dict.navigation?.services || "Technical Services"}
        >
          {services.map((service) => {
            const serviceHref = "/" + lang + "/services/" + service.slug
            const tags = Array.isArray(service.tags)
              ? service.tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim()))
              : []

            return (
              <div key={service.slug} className="group relative">
                <Link
                  href={serviceHref}
                  className={cn(
                    "flex min-h-12 items-center gap-2 rounded-xl px-2.5 text-xs font-semibold text-foreground transition-colors",
                    "hover:bg-primary/10 hover:text-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-secondary/60 text-primary">
                    <Settings2 className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 line-clamp-2 leading-4">{service.title}</span>
                  {tags.length > 0 && (
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-focus-within:translate-x-0.5"
                      aria-hidden="true"
                    />
                  )}
                </Link>

                {tags.length > 0 && (
                  <div className="pointer-events-none invisible absolute left-full top-0 z-[70] ml-2 w-72 translate-x-1 rounded-2xl border border-border/70 bg-card p-2 opacity-0 shadow-2xl transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-x-0 group-focus-within:opacity-100">
                    <div className="border-b border-border/60 px-3 pb-2 pt-1 text-xs font-bold text-foreground">
                      {service.title}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5 px-1 pt-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1.5 text-[11px] leading-4 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
