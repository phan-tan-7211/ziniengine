"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ChevronDown, Globe, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { DynamicIcon } from "./ui/dynamic-icon"
import { ThemeToggle } from "./theme-toggle"
import { SiteLogoMark, SiteLogoWordmark } from "./site-logo"
import { SmartPrefetchLink } from "./smart-prefetch-link"

const languages = [
  { code: "vi", name: "Tiếng Việt", flag: "VN" },
  { code: "en", name: "English", flag: "US" },
  { code: "jp", name: "日本語", flag: "JP" },
  { code: "kr", name: "한국어", flag: "KR" },
  { code: "cn", name: "中文", flag: "CN" },
]

interface DesktopNavigationProps {
  lang: string
  dict: any
  pathname: string
  isScrolled: boolean
  isMegaOpen: boolean
  isLangOpen: boolean
  setIsMegaOpen: (open: boolean) => void
  setIsLangOpen: (open: boolean) => void
  handleLangChange: (lang: string) => void
  handlePrefetchLang: (lang: string) => void
  menuItems: Array<{ name: string; href: string; hasMega?: boolean }>
  serviceItems: Array<{ icon: any; slug: string; title?: string; desc?: string; language?: string }>
  currentLang: { code: string; name: string; flag: string }
}

export function DesktopNavigation({
  lang,
  dict,
  pathname,
  isScrolled,
  isMegaOpen,
  isLangOpen,
  setIsMegaOpen,
  setIsLangOpen,
  handleLangChange,
  handlePrefetchLang,
  menuItems,
  serviceItems,
  currentLang,
}: DesktopNavigationProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsSwipeEnabled(localStorage.getItem("desktop-swipe") === "true")
  }, [])

  const toggleSwipe = () => {
    const newValue = !isSwipeEnabled
    setIsSwipeEnabled(newValue)
    localStorage.setItem("desktop-swipe", String(newValue))
    window.dispatchEvent(new Event("storage"))
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === `/${lang}`) return pathname === `/${lang}`
    return pathname.startsWith(href)
  }

  return (
    <div className="relative z-[10010] overflow-visible">
      <div className="hidden border-b border-border/60 bg-background/75 backdrop-blur-lg lg:block">
        <div className="content-shell flex min-h-10 items-center justify-between gap-6 py-1.5 text-sm">
          <div className="flex items-center gap-5 text-muted-foreground">
            <a href={`tel:${dict.common.phone_label}`} className="inline-flex min-h-9 items-center gap-2 rounded-md px-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Phone className="size-3.5" aria-hidden="true" /><span>{dict.common.phone_label}</span></a>
            <a href={`mailto:${dict.common.email_label}`} className="inline-flex min-h-9 items-center gap-2 rounded-md px-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Mail className="size-3.5" aria-hidden="true" /><span>{dict.common.email_label}</span></a>
          </div>

          <div className="flex items-center gap-4">
            <p className="border-r border-border/60 pr-4 italic text-muted-foreground"><span className="font-bold text-primary">{">"}</span> {dict.common.slogan_top}</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggleSwipe} className="rounded-md px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{dict.common.swipe_desktop || "Swipe Desktop"}</button>
              <button type="button" aria-label={dict.common.swipe_desktop || "Swipe Desktop"} aria-pressed={mounted && isSwipeEnabled} onClick={toggleSwipe} className={cn("relative h-7 w-12 rounded-full border border-border/70 shadow-inner transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", mounted && isSwipeEnabled ? "bg-primary" : "bg-secondary")}>
                <span className={cn("absolute left-1 top-1 size-5 rounded-full bg-background shadow-sm transition-transform", mounted && isSwipeEnabled && "translate-x-5")} />
              </button>
              <div className="h-5 w-px bg-border/60" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <nav className="content-shell relative z-[10020] hidden overflow-visible py-3 lg:block" aria-label="Primary navigation">
        <div className="flex min-h-16 items-center justify-between gap-4 overflow-visible">
          <SmartPrefetchLink href={`/${lang}`} aria-label={dict.navigation.home || "Home"} className="group relative z-[110] flex min-h-12 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <SiteLogoMark size="lg" />
            <SiteLogoWordmark lang={lang} fallbackTagline={dict.common.logo_subtitle} titleClassName="text-2xl font-serif font-bold tracking-tight text-foreground" taglineClassName="-mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground" />
          </SmartPrefetchLink>

          <div className="relative z-[10030] flex items-center gap-0.5 overflow-visible">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className={cn("relative flex h-full items-center overflow-visible", item.hasMega && "z-[10040]")}
                onMouseEnter={() => item.hasMega && setIsMegaOpen(true)}
                onMouseLeave={() => item.hasMega && setIsMegaOpen(false)}
                onFocusCapture={() => item.hasMega && setIsMegaOpen(true)}
                onBlurCapture={(event) => {
                  if (!item.hasMega) return
                  const nextTarget = event.relatedTarget as Node | null
                  if (!nextTarget || !event.currentTarget.contains(nextTarget)) setIsMegaOpen(false)
                }}
              >
                <SmartPrefetchLink
                  href={item.href}
                  intentDelayMs={40}
                  aria-haspopup={item.hasMega ? "menu" : undefined}
                  aria-expanded={item.hasMega ? isMegaOpen : undefined}
                  className={cn("group relative inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isActive(item.href) ? "text-primary" : "text-foreground hover:text-primary")}
                >
                  {item.name}
                  {item.hasMega && <ChevronDown className={cn("size-4 transition-transform duration-300", isMegaOpen && "rotate-180")} aria-hidden="true" />}
                  <span className={cn("absolute bottom-1.5 left-3 right-3 h-0.5 origin-left rounded-full bg-primary transition-transform duration-300", isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                </SmartPrefetchLink>

                <AnimatePresence>
                  {item.hasMega && isMegaOpen && (
                    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.99 }} transition={{ duration: 0.16, ease: "easeOut" }} className="absolute left-1/2 top-full z-[10060] -translate-x-1/2 pt-3" role="menu">
                      <div className="absolute left-0 right-0 top-0 h-4 bg-transparent" aria-hidden="true" />
                      <div className="relative w-[720px] rounded-2xl border border-border/70 bg-card/95 p-5 shadow-card backdrop-blur-xl">
                        <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
                          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{dict.navigation.services}</p><p className="mt-1 text-xs text-muted-foreground">{serviceItems.length} services</p></div>
                          <SmartPrefetchLink href={`/${lang}/services`} intentDelayMs={20} onClick={() => setIsMegaOpen(false)} className="rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View all →</SmartPrefetchLink>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {serviceItems.map((service, index) => (
                            <SmartPrefetchLink key={service.slug || `service-${index}`} href={`/${lang}/services/${service.slug}`} intentDelayMs={20} role="menuitem" className="group/item relative flex min-h-20 items-start gap-3 overflow-hidden rounded-xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setIsMegaOpen(false)}>
                              {service.language && service.language !== lang && <span className="absolute right-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight text-primary-foreground">{service.language}</span>}
                              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover/item:bg-primary"><DynamicIcon iconData={service.icon} className="size-5 text-primary transition-colors group-hover/item:text-primary-foreground" /></div>
                              <div className="min-w-0 pr-5"><h4 className="truncate font-semibold text-foreground transition-colors group-hover/item:text-primary">{service.title || "Dịch vụ"}</h4><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{service.desc || "Mô tả đang cập nhật..."}</p></div>
                            </SmartPrefetchLink>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="relative z-[10030] flex items-center gap-3">
            <div className="relative">
              <button type="button" aria-haspopup="menu" aria-expanded={isLangOpen} onClick={() => setIsLangOpen(!isLangOpen)} className={cn("flex min-h-11 items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isLangOpen && "border-primary/40")}>
                <Globe className="size-4" aria-hidden="true" /><span className="font-semibold">{currentLang.flag}</span><ChevronDown className={cn("size-4 transition-transform duration-300", isLangOpen && "rotate-180")} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: 8 }} className="absolute right-0 top-full z-[10060] mt-2 w-48 overflow-hidden rounded-xl border border-border/70 bg-card shadow-card" role="menu">
                    {languages.map((l) => (
                      <button key={l.code} type="button" role="menuitem" onMouseEnter={() => handlePrefetchLang(l.code)} onFocus={() => handlePrefetchLang(l.code)} onClick={() => handleLangChange(l.code)} className={cn("flex min-h-11 w-full items-center gap-3 px-4 text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", lang === l.code ? "bg-primary/5 font-semibold text-primary" : "text-foreground")}>
                        <span className="w-6 text-xs font-black text-muted-foreground">{l.flag}</span><span>{l.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button asChild className="min-h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary/90">
              <SmartPrefetchLink href={`/${lang}/contact`} intentDelayMs={40}>{dict.common.contact_btn}</SmartPrefetchLink>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  )
}
