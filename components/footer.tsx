"use client"

import React from "react"
import { ArrowRight, ExternalLink, Mail, MapPin, MessageCircle, Phone, Youtube, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSiteSettings } from "@/components/site-settings-context"
import { SiteLogoMark, SiteLogoWordmark } from "@/components/site-logo"
import { resolveSiteName } from "@/lib/site-settings"
import { SmartPrefetchLink } from "@/components/smart-prefetch-link"

interface LegalDocLink { _id: string; slug: string; title: string; language: string }
interface FooterService { _id?: string; slug: string; title?: string; language?: string }
function TextSocialIcon({ text }: { text: string }) { return <span className="text-[9px] font-black uppercase tracking-tight" aria-hidden="true">{text}</span> }

interface FooterProps {
  lang: string
  dict: any
  initialServices?: FooterService[]
  initialLegalDocs?: LegalDocLink[]
}

export function Footer({ lang, dict, initialServices = [], initialLegalDocs = [] }: FooterProps) {
  const footer = dict?.footer || {}
  const navigation = dict?.navigation || {}
  const common = dict?.common || {}
  const siteSettings = useSiteSettings()
  const siteName = resolveSiteName(siteSettings)
  const { phoneDisplay, phoneTel, email, wechatId, wechatUrl, lineUrl, facebookUrl, youtubeUrl, tiktokUrl, twitterUrl, sharedLocations = [] } = siteSettings

  const quickLinks = [
    { name: navigation?.home || "Trang chủ", href: `/${lang}` },
    { name: navigation?.about || "Giới thiệu", href: `/${lang}/about` },
    { name: navigation?.services || "Dịch vụ", href: `/${lang}/services` },
    { name: navigation?.products || "Sản phẩm", href: `/${lang}/products` },
    { name: navigation?.projects || "Dự án", href: `/${lang}/portfolio` },
    { name: navigation?.blog || "Blog", href: `/${lang}/blog` },
  ]

  const socialLinks = [
    facebookUrl ? { href: facebookUrl, label: "Facebook", icon: <Facebook className="size-4" /> } : null,
    youtubeUrl ? { href: youtubeUrl, label: "YouTube", icon: <Youtube className="size-4" /> } : null,
    tiktokUrl ? { href: tiktokUrl, label: "TikTok", icon: <TextSocialIcon text="TT" /> } : null,
    lineUrl ? { href: lineUrl, label: "LINE", icon: <TextSocialIcon text="LINE" /> } : null,
    twitterUrl ? { href: twitterUrl, label: "X / Twitter", icon: <TextSocialIcon text="X" /> } : null,
    wechatUrl ? { href: wechatUrl, label: wechatId ? `WeChat ${wechatId}` : "WeChat", icon: <MessageCircle className="size-4" /> } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: React.ReactNode }>

  const fallbackLegalLinks = [
    { name: footer?.privacy_policy || "Chính sách bảo mật", slug: "chinh-sach-bao-mat" },
    { name: footer?.terms_of_use || "Điều khoản sử dụng", slug: "dieu-khoan-su-dung" },
    { name: footer?.cookie_policy || "Chính sách cookie", slug: "chinh-sach-cookie" },
  ]
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border/60 bg-secondary/20">
      <div className="content-shell py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <SmartPrefetchLink href={`/${lang}`} aria-label={navigation?.home || "Home"} className="mb-6 inline-flex min-h-12 items-center gap-3 rounded-xl" viewportPrefetch={false}>
              <SiteLogoMark size="md" />
              <SiteLogoWordmark lang={lang} fallbackTagline={common?.logo_subtitle || "Engineering Solutions"} titleClassName="text-xl font-serif font-bold tracking-tight text-foreground" taglineClassName="-mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground" />
            </SmartPrefetchLink>
            <p className="mb-6 max-w-sm text-sm leading-6 text-muted-foreground">{footer?.description || "Đối tác cung cấp sản phẩm và giải pháp kỹ thuật cho khách hàng."}</p>
            {socialLinks.length > 0 && <div className="flex flex-wrap gap-2">{socialLinks.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="inline-flex size-11 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground">{item.icon}</a>)}</div>}
          </div>

          <div>
            <h4 className="mb-5 text-sm font-serif font-bold uppercase tracking-wider">{footer?.quick_links || "Liên kết nhanh"}</h4>
            <ul className="space-y-1">{quickLinks.map((link) => <li key={link.href}><SmartPrefetchLink href={link.href} viewportPrefetch={false} className="group inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowRight className="size-3" />{link.name}</SmartPrefetchLink></li>)}</ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-serif font-bold uppercase tracking-wider">{navigation?.services || "Dịch vụ"}</h4>
            <ul className="max-h-[250px] space-y-1 overflow-y-auto pr-2">{initialServices.map((service, index) => <li key={service._id || service.slug || index}><SmartPrefetchLink href={`/${lang}/services/${service.slug}`} viewportPrefetch={false} className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowRight className="size-3" />{service.title}</SmartPrefetchLink></li>)}</ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-serif font-bold uppercase tracking-wider">{navigation?.contact || "Liên hệ"}</h4>
            <div className="mb-7 space-y-3">
              {sharedLocations.map((location, index) => {
                const mapHref = location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address || "")}`
                return <a key={location._key || index} href={mapHref} target="_blank" rel="noopener noreferrer" className="group flex min-h-10 items-start gap-3 text-sm text-muted-foreground hover:text-primary"><MapPin className="mt-0.5 size-5 shrink-0 text-primary" /><span>{location.name?.[lang as "vi" | "en" | "jp" | "kr" | "cn"] && <strong className="mr-1 font-medium text-foreground">{location.name?.[lang as "vi" | "en" | "jp" | "kr" | "cn"]}:</strong>}{location.address}<span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-primary">Map <ExternalLink className="size-3" /></span></span></a>
              })}
              {phoneDisplay && phoneTel && <a href={`tel:${phoneTel}`} className="flex min-h-10 items-center gap-3 text-sm text-muted-foreground hover:text-primary"><Phone className="size-5 text-primary" />{phoneDisplay}</a>}
              {email && <a href={`mailto:${email}`} className="flex min-h-10 items-center gap-3 text-sm text-muted-foreground hover:text-primary"><Mail className="size-5 text-primary" /><span className="break-all">{email}</span></a>}
            </div>
            <h4 className="mb-3 text-xs font-serif font-bold uppercase tracking-widest">{footer?.newsletter || "Bản tin"}</h4>
            <form className="flex gap-2" onSubmit={(event) => event.preventDefault()}><Input type="email" placeholder={footer?.placeholder_email || "Email của bạn"} /><Button type="submit" size="icon"><ArrowRight className="size-4" /></Button></form>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 bg-secondary/35">
        <div className="content-shell flex flex-col items-center justify-between gap-4 py-5 md:flex-row">
          <p className="text-xs text-muted-foreground">{footer?.copyright || `© ${currentYear} ${siteName}. All rights reserved.`}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {initialLegalDocs.length ? initialLegalDocs.map((link) => <SmartPrefetchLink key={link._id} href={`/${link.language || lang}/policy/${link.slug}`} viewportPrefetch={false} className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{link.title}</SmartPrefetchLink>) : fallbackLegalLinks.map((link) => <SmartPrefetchLink key={link.slug} href={`/${lang}/policy/${link.slug}`} viewportPrefetch={false} className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{link.name}</SmartPrefetchLink>)}
          </div>
        </div>
      </div>
    </footer>
  )
}
