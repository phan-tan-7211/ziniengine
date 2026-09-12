import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { DetailCollectionLink } from "@/components/detail-collection-link"
import { SmartPrefetchLink } from "@/components/smart-prefetch-link"

export interface DetailRelatedItem {
  id: string
  href: string
  title: string
  description?: string
  imageUrl?: string
  eyebrow?: string
}

interface DetailRelatedSectionProps {
  eyebrow: string
  title: string
  items: DetailRelatedItem[]
  viewAllHref: string
  viewAllLabel: string
  readMoreLabel: string
}

export function DetailRelatedSection({
  eyebrow,
  title,
  items,
  viewAllHref,
  viewAllLabel,
  readMoreLabel,
}: DetailRelatedSectionProps) {
  if (items.length === 0) {
    return (
      <section className="border-t border-border/50 bg-background py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <DetailCollectionLink href={viewAllHref} label={viewAllLabel} />
        </div>
      </section>
    )
  }

  return (
    <section className="section-space border-t border-border/50 bg-background" aria-labelledby="detail-related-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
            <h2 id="detail-related-title" className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              {title}
            </h2>
          </div>
          <DetailCollectionLink href={viewAllHref} label={viewAllLabel} />
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item, index) => (
            <article
              key={item.id}
              className="group h-full overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-card shadow-soft transition-all duration-300 lg:hover:-translate-y-2 lg:hover:scale-[1.01] lg:hover:border-primary/40 lg:hover:shadow-card"
            >
              <SmartPrefetchLink
                href={item.href}
                prefetch={index === 0}
                aria-label={`${readMoreLabel}: ${item.title}`}
                className="flex h-full flex-col rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                  <Image
                    src={item.imageUrl || "/images/placeholder-machine.webp"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 lg:group-hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-70 transition-opacity lg:group-hover:opacity-95" aria-hidden="true" />
                  {item.eyebrow && (
                    <span className="absolute bottom-3 left-3 z-10 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                      {item.eyebrow}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-foreground transition-colors lg:group-hover:text-primary">{item.title}</h3>
                  {item.description && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p>}
                  <span className="mt-5 inline-flex items-center gap-1.5 border-t border-border/50 pt-4 text-sm font-semibold text-primary">
                    {readMoreLabel}
                    <ArrowRight className="size-4 transition-transform lg:group-hover:translate-x-1.5" aria-hidden="true" />
                  </span>
                </div>
              </SmartPrefetchLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
