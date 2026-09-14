import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { BriefcaseBusiness, ChevronRight, Package, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ServiceItem = {
  _id?: string
  groupKey?: string
  slug?: string
  title?: string
}

type SidebarChild = {
  label: string
  href: string
}

type SidebarGroup = {
  key: "services" | "products" | "projects"
  label: string
  href: string
  icon: LucideIcon
  children: SidebarChild[]
}

interface CatalogSidebarProps {
  lang: string
  dict: any
  active: SidebarGroup["key"]
  serviceItems?: ServiceItem[]
}

export function CatalogSidebar({ lang, dict, active, serviceItems = [] }: CatalogSidebarProps) {
  const servicesLabel = dict.navigation?.services || "Services"
  const productsLabel = dict.navigation?.products || "Products"
  const projectsLabel = dict.navigation?.projects || "Projects"
  const serviceItemsWithTitles = serviceItems.filter(
    (item): item is ServiceItem & { slug: string; title: string } =>
      Boolean(item.slug && item.title),
  )

  const groups: SidebarGroup[] = [
    {
      key: "services",
      label: servicesLabel,
      href: "/" + lang + "/services",
      icon: Settings2,
      children: serviceItemsWithTitles.map((item) => ({
        label: item.title,
        href: "/" + lang + "/services/" + item.slug,
      })),
    },
    {
      key: "products",
      label: productsLabel,
      href: "/" + lang + "/products",
      icon: Package,
      children: serviceItems
        .filter((item): item is ServiceItem & { _id: string; title: string } => Boolean(item._id && item.title))
        .map((item) => ({
          label: item.title,
          href: "/" + lang + "/products?category=" + encodeURIComponent(item._id),
        })),
    },
    {
      key: "projects",
      label: projectsLabel,
      href: "/" + lang + "/portfolio",
      icon: BriefcaseBusiness,
      children: serviceItems
        .filter((item): item is ServiceItem & { groupKey: string; title: string } => Boolean(item.groupKey && item.title))
        .map((item) => ({
          label: item.title,
          href: "/" + lang + "/portfolio?category=" + encodeURIComponent(item.groupKey),
        })),
    },
  ]

  return (
    <aside
      aria-label={dict.catalog_sidebar?.title || "Catalog"}
      className="hidden w-56 shrink-0 lg:block"
    >
      <div className="sticky top-24 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-card backdrop-blur-xl">
        <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {dict.catalog_sidebar?.title || "Catalog"}
        </div>

        <nav className="space-y-1" aria-label={dict.catalog_sidebar?.title || "Catalog"}>
          {groups.map((group) => {
            const Icon = group.icon
            const isActive = active === group.key

            return (
              <div key={group.key} className="group relative">
                <Link
                  href={group.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-2 rounded-xl px-2.5 text-xs font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary/80 hover:text-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                      isActive
                        ? "border-primary/20 bg-primary/15"
                        : "border-border/70 bg-secondary/60",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{group.label}</span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-focus-within:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>

                {group.children.length > 0 && (
                  <div className="pointer-events-none invisible absolute left-full top-0 z-[70] ml-2 w-72 translate-x-1 rounded-2xl border border-border/70 bg-card p-2 opacity-0 shadow-2xl transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-x-0 group-focus-within:opacity-100">
                    <div className="border-b border-border/60 px-3 pb-2 pt-1 text-xs font-bold text-foreground">
                      {group.label}
                    </div>
                    <div className="mt-1 max-h-[min(28rem,calc(100vh-10rem))] overflow-y-auto">
                      {group.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex min-h-10 items-center rounded-xl px-3 text-xs leading-5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span className="mr-2 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                          <span className="line-clamp-2">{child.label}</span>
                        </Link>
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
