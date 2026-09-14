"use client"

import React, { useEffect, useState } from "react"
import { ArrowUp, MapPin, Phone } from "lucide-react"
import { useSiteSettings } from "@/components/site-settings-context"

const itemBase = "group relative flex size-16 flex-col items-center justify-center p-3 text-center transition-all duration-300 sm:size-20"

export function FloatingContactBar() {
  const { phoneDisplay, phoneTel, zaloNumber, addressDisplay, googleMapsUrl } = useSiteSettings()
  const [showTop, setShowTop] = useState(false)
  const [nearFooter, setNearFooter] = useState(false)

  useEffect(() => {
    let raf = 0
    let previousFooter: HTMLElement | null = null
    let previousDockState: boolean | null = null

    const publishDockState = (active: boolean) => {
      if (previousDockState === active) return
      previousDockState = active
      window.dispatchEvent(new CustomEvent("zinitek-contact-dock", { detail: { active } }))
      document.documentElement.dataset.contactDocked = active ? "true" : "false"
    }

    const update = () => {
      raf = 0
      setShowTop(window.scrollY > 300)

      const footer = document.querySelector("footer") as HTMLElement | null
      const isMobileLayout = window.innerWidth < 1280
      const rect = footer?.getBoundingClientRect()
      const active = Boolean(isMobileLayout && rect && rect.top <= window.innerHeight - 12)

      if (previousFooter && previousFooter !== footer) previousFooter.style.paddingBottom = ""
      previousFooter = footer

      if (footer) {
        footer.style.paddingBottom = active
          ? "calc(5.25rem + env(safe-area-inset-bottom))"
          : ""
      }

      setNearFooter(active)
      publishDockState(active)
    }

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule, { passive: true })

    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      if (raf) window.cancelAnimationFrame(raf)
      if (previousFooter) previousFooter.style.paddingBottom = ""
      delete document.documentElement.dataset.contactDocked
      window.dispatchEvent(new CustomEvent("zinitek-contact-dock", { detail: { active: false } }))
    }
  }, [])

  const scrollTop = () => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  }

  const shellClass = nearFooter
    ? "fixed bottom-0 left-1/2 z-50 flex -translate-x-1/2 flex-row overflow-visible rounded-t-xl border border-b-0 border-border bg-background shadow-lg transition-all duration-300 xl:bottom-auto xl:left-auto xl:right-0 xl:top-1/2 xl:-translate-x-0 xl:-translate-y-1/2 xl:flex-col xl:rounded-l-xl xl:rounded-r-none xl:border-r-0 xl:border-b"
    : "fixed right-0 top-1/2 z-50 flex -translate-y-1/2 flex-col overflow-visible rounded-l-xl border border-r-0 border-border bg-background shadow-lg transition-all duration-300"

  const separatorClass = nearFooter ? "border-l border-border" : "border-t border-border"

  const expandClass = nearFooter
    ? "absolute bottom-full left-[-1px] z-[-1] mb-0 flex h-12 min-w-[calc(100%+2px)] items-center justify-center whitespace-nowrap rounded-t-xl border px-5 text-sm font-bold text-white opacity-0 invisible translate-y-2 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:h-14 sm:text-base"
    : "absolute right-full top-[-1px] z-[-1] flex h-[calc(100%+2px)] items-center whitespace-nowrap rounded-l-xl border px-6 text-sm font-bold text-white opacity-0 invisible translate-x-2 transition-all duration-300 group-hover:visible group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:text-base"

  const zaloHref = zaloNumber ? `https://zalo.me/${zaloNumber.replace(/\D/g, "")}` : undefined
  const mapHref = googleMapsUrl || (addressDisplay ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressDisplay)}` : undefined)

  return (
    <aside className={shellClass} aria-label="Quick contact">
      {phoneDisplay && phoneTel && (
        <a
          href={`tel:${phoneTel}`}
          aria-label={`Hotline ${phoneDisplay}`}
          className={`${itemBase} ${nearFooter ? "rounded-tl-xl" : "rounded-tl-xl"} hover:bg-orange-50 dark:hover:bg-orange-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f97316]`}
        >
          <Phone className="relative z-10 mb-1 size-5 text-[#f97316] transition-transform group-hover:scale-110 sm:size-6" aria-hidden="true" />
          <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-foreground transition-colors group-hover:text-[#f97316] sm:text-xs">Hotline</span>
          <span className={`${expandClass} border-[#f97316] bg-[#f97316] shadow-[0_8px_24px_rgba(249,115,22,0.35)]`}>{phoneDisplay}</span>
        </a>
      )}

      {zaloHref && (
        <a
          href={zaloHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo"
          className={`${itemBase} ${separatorClass} hover:bg-blue-50 dark:hover:bg-blue-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0068ff]`}
        >
          <span className="relative z-10 mb-1 flex size-7 items-center justify-center rounded-full bg-[#0068ff] text-[9px] font-black leading-none text-white shadow-sm transition-transform group-hover:scale-110 sm:size-8 sm:text-[10px]">Zalo</span>
          <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-foreground transition-colors group-hover:text-[#0068ff] sm:text-xs">Zalo</span>
          <span className={`${expandClass} border-[#0068ff] bg-[#0068ff] shadow-[0_8px_24px_rgba(0,104,255,0.35)]`}>Chat Zalo ngay</span>
        </a>
      )}

      {mapHref && (
        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={addressDisplay ? `Open Google Maps: ${addressDisplay}` : "Open Google Maps"}
          className={`${itemBase} ${separatorClass} hover:bg-red-50 dark:hover:bg-red-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500`}
        >
          <MapPin className="relative z-10 mb-1 size-5 text-red-500 transition-transform group-hover:scale-110 sm:size-6" aria-hidden="true" />
          <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-foreground transition-colors group-hover:text-red-500 sm:text-xs">Map</span>
          <span className={`${expandClass} border-red-500 bg-red-500 shadow-[0_8px_24px_rgba(239,68,68,0.35)]`}>Chỉ đường Google Maps</span>
        </a>
      )}

      {showTop && (
        <button
          type="button"
          onClick={scrollTop}
          aria-label="Back to top"
          className={`${itemBase} ${separatorClass} ${nearFooter ? "rounded-tr-xl" : "rounded-bl-xl"} hover:bg-orange-50 dark:hover:bg-orange-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f97316]`}
        >
          <ArrowUp className="relative z-10 mb-1 size-5 text-[#f97316] transition-transform group-hover:-translate-y-1 sm:size-6" aria-hidden="true" />
          <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-foreground transition-colors group-hover:text-[#f97316] sm:text-xs">Lên Top</span>
          <span className={`${expandClass} border-[#f97316] bg-[#f97316] shadow-[0_8px_24px_rgba(249,115,22,0.35)]`}>Lên đầu trang</span>
        </button>
      )}
    </aside>
  )
}
