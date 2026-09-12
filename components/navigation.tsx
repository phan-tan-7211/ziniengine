"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { DesktopNavigation } from "./navigation-desktop"
import { MobileNavigation } from "./navigation-mobile"
import { SiteLogoMark, SiteLogoWordmark } from "./site-logo"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"

interface ServiceMenuItem {
  icon?: any
  slug: string
  title?: string
  desc?: string
  language?: string
}

interface NavigationProps {
  lang: string
  dict: any
  initialServices?: ServiceMenuItem[]
}

function canPrefetch() {
  if (typeof navigator === "undefined") return false
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (connection?.saveData) return false
  return connection?.effectiveType !== "slow-2g" && connection?.effectiveType !== "2g"
}

export function Navigation({ lang, dict, initialServices = [] }: NavigationProps) {
  const reduceMotion = useReducedMotion()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [services, setServices] = useState<ServiceMenuItem[]>(initialServices)

  const pathname = usePathname()
  const router = useRouter()
  const mobileMainMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setServices(initialServices), [initialServices, lang])

  useEffect(() => {
    let previousY = window.scrollY
    const handleScroll = () => {
      const currentY = window.scrollY
      setIsScrolled(currentY > 10)

      if (window.innerWidth < 1024) {
        if (currentY > previousY + 5 && currentY > 80) setIsVisible(false)
        else if (currentY < previousY - 10 || currentY <= 80) setIsVisible(true)
      } else {
        setIsVisible(true)
      }
      previousY = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflowY = "hidden"
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflowY = ""
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1)
    }

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflowY = ""
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const activeItem = mobileMainMenuRef.current?.querySelector('[data-active="true"]')
    activeItem?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" })
  }, [pathname, reduceMotion])

  const languages = [
    { code: "vi", name: "Tiếng Việt", flag: "VN" },
    { code: "en", name: "English", flag: "US" },
    { code: "jp", name: "日本語", flag: "JP" },
    { code: "kr", name: "한국어", flag: "KR" },
    { code: "cn", name: "中文", flag: "CN" },
  ]
  const currentLang = languages.find((item) => item.code === lang) || languages[0]

  const handleLangChange = (nextLang: string) => {
    if (nextLang === lang) return
    setIsLangOpen(false)
    setIsMobileMenuOpen(false)
    const segments = pathname.split("/")
    const translationMap = (window as any).companyTranslations || (window as any).zinitekTranslations

    if (segments.length === 4 && segments[2] === "services" && translationMap?.[nextLang]) {
      segments[1] = nextLang
      segments[3] = translationMap[nextLang]
    } else {
      segments[1] = nextLang
    }
    router.push(segments.join("/"))
  }

  const menuItems = [
    { name: dict.navigation.home, href: `/${lang}` },
    { name: dict.navigation.about, href: `/${lang}/about` },
    { name: dict.navigation.services, href: `/${lang}/services`, hasMega: true },
    { name: dict.navigation.products, href: `/${lang}/products` },
    { name: dict.navigation.projects, href: `/${lang}/portfolio` },
    { name: dict.navigation.blog, href: `/${lang}/blog` },
    { name: dict.navigation.contact, href: `/${lang}/contact` },
  ]

  useEffect(() => {
    if (!canPrefetch()) return
    const currentIndex = menuItems.findIndex((item) => item.href === `/${lang}` ? pathname === item.href : pathname.startsWith(item.href))
    const candidates = [menuItems[currentIndex - 1]?.href, menuItems[currentIndex + 1]?.href].filter(Boolean) as string[]
    const timer = window.setTimeout(() => candidates.forEach((href) => router.prefetch(href)), 120)
    return () => window.clearTimeout(timer)
  }, [pathname, lang])

  const handlePrefetchLang = (targetLang: string) => {
    const segments = pathname.split("/")
    segments[1] = targetLang
    router.prefetch(segments.join("/"))
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 9998,
        transform: isVisible ? "translateY(0)" : "translateY(-110%)",
        opacity: isVisible ? 1 : 0,
        transition: reduceMotion ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s, background-color 0.5s",
        pointerEvents: isVisible ? "auto" : "none",
      }}
      className={cn(
        "text-foreground",
        isScrolled ? "border-b border-border/60 bg-background/92 shadow-soft backdrop-blur-xl" : "bg-background/35 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
      )}
    >
      <motion.div initial={reduceMotion ? false : { y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }}>
        <div className="hidden overflow-visible lg:block">
          <DesktopNavigation
            lang={lang}
            dict={dict}
            pathname={pathname}
            isScrolled={isScrolled}
            isMegaOpen={isMegaOpen}
            isLangOpen={isLangOpen}
            setIsMegaOpen={setIsMegaOpen}
            setIsLangOpen={setIsLangOpen}
            handleLangChange={handleLangChange}
            handlePrefetchLang={handlePrefetchLang}
            menuItems={menuItems}
            serviceItems={services}
            currentLang={currentLang}
          />
        </div>

        <div className="content-shell flex min-h-16 items-center justify-between gap-2 py-2 lg:hidden">
          <Link href={`/${lang}`} prefetch aria-label={dict.navigation.home || "Home"} className="relative z-[110] flex min-h-11 shrink-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <SiteLogoMark size="sm" />
            <SiteLogoWordmark lang={lang} fallbackTagline={dict.common.logo_subtitle} className="hidden min-[390px]:block" titleClassName="text-base font-bold tracking-tight text-foreground" hideTagline />
          </Link>

          <div
            ref={mobileMainMenuRef}
            className="relative flex h-11 flex-1 items-center gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card/70 px-1.5 no-scrollbar shadow-soft backdrop-blur-lg touch-pan-x"
            style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
          >
            {menuItems.map((item, index) => {
              const active = pathname === item.href || (item.href !== `/${lang}` && pathname.startsWith(item.href))
              const Icon = item.name === dict.navigation.home ? LucideIcons.Home : item.name === dict.navigation.about ? LucideIcons.Info : item.name === dict.navigation.services ? LucideIcons.Settings : item.name === dict.navigation.products ? LucideIcons.Package : item.name === dict.navigation.projects ? LucideIcons.Briefcase : item.name === dict.navigation.blog ? LucideIcons.FileText : LucideIcons.Phone

              return (
                <button
                  key={`${item.href}-${index}`}
                  type="button"
                  data-active={active}
                  aria-label={item.name}
                  onPointerDown={() => { if (canPrefetch()) router.prefetch(item.href) }}
                  onFocus={() => { if (canPrefetch()) router.prefetch(item.href) }}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(15)
                    router.push(item.href)
                  }}
                  className={cn("relative flex h-9 min-w-[58px] shrink-0 flex-col items-center justify-center rounded-xl px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "bg-primary/10 text-primary" : "text-muted-foreground active:bg-secondary hover:text-foreground")}
                >
                  <Icon className="mb-0.5 size-3.5" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                  <span className="max-w-[56px] truncate text-[8px] font-bold uppercase tracking-tight">{item.name}</span>
                </button>
              )
            })}
          </div>

          <MobileNavigation
            lang={lang}
            dict={dict}
            pathname={pathname}
            isMobileMenuOpen={isMobileMenuOpen}
            isLangOpen={isLangOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            setIsLangOpen={setIsLangOpen}
            handleLangChange={handleLangChange}
            handlePrefetchLang={handlePrefetchLang}
            menuItems={menuItems}
            serviceItems={services}
            currentLang={currentLang}
          />
        </div>
      </motion.div>
    </header>
  )
}
