"use client"

import React, { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { AnimatePresence, motion, useInView } from "framer-motion"
import { ChevronRight, Clock, ExternalLink, Mail, MapPin, Phone, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSiteSettings } from "@/components/site-settings-context"
import { sanityCdnClient } from "@/lib/sanity-client"

type LocaleKey = "vi" | "en" | "jp" | "kr" | "cn"
type Localized = Partial<Record<LocaleKey, string>>

interface CompanyLocation {
  _key?: string
  enabled?: boolean
  kind?: "factory" | "office" | "factory_office" | "other"
  name?: Localized
  address?: string
  googleMapsUrl?: string
}

interface WorkingHour {
  _key?: string
  enabled?: boolean
  label?: Localized
  value?: Localized & { common?: string }
  accent?: boolean
}

interface FormCopy {
  step?: string
  infoTitle?: string
  serviceTitle?: string
  fileTitle?: string
  nameLabel?: string
  companyLabel?: string
  emailLabel?: string
  phoneLabel?: string
  serviceLabel?: string
  messageLabel?: string
  fileLabel?: string
  namePlaceholder?: string
  companyPlaceholder?: string
  emailPlaceholder?: string
  phonePlaceholder?: string
  servicePlaceholder?: string
  messagePlaceholder?: string
  fileHint?: string
  fileTypes?: string
  next?: string
  prev?: string
  submit?: string
  success?: string
  required?: string
  error?: string
  services?: string[]
}

interface ContactSettings {
  enabled?: boolean
  badge?: Localized
  title?: Localized
  titleHighlight?: Localized
  description?: Localized
  workingHoursTitle?: Localized
  workingHours?: WorkingHour[]
  form?: Partial<Record<LocaleKey, FormCopy>>
}

const kindLabels: Record<LocaleKey, Record<string, string>> = {
  vi: { factory: "Nhà máy", office: "Văn phòng", factory_office: "Nhà máy & Văn phòng", other: "Địa điểm" },
  en: { factory: "Factory", office: "Office", factory_office: "Factory & Office", other: "Location" },
  jp: { factory: "工場", office: "事務所", factory_office: "工場・事務所", other: "所在地" },
  kr: { factory: "공장", office: "사무실", factory_office: "공장 & 사무실", other: "위치" },
  cn: { factory: "工厂", office: "办公室", factory_office: "工厂与办公室", other: "地点" },
}

export function ContactSection({ dict, lang = "vi" }: { dict: any; lang?: string }) {
  const locale = (["vi", "en", "jp", "kr", "cn"].includes(lang) ? lang : "vi") as LocaleKey
  const t = dict?.contact_section || {}
  const { phoneDisplay, phoneTel, email, sharedLocations = [] } = useSiteSettings()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState<ContactSettings | null>(null)
  const [formData, setFormData] = useState({ name: "", company: "", email: "", phone: "", service: "", message: "", file: null as File | null })

  useEffect(() => {
    let active = true
    sanityCdnClient
      .fetch<ContactSettings | null>(`*[_type == "contactSettings" && _id == "contactSettings" && !(_id in path("drafts.**"))][0]{enabled,badge,title,titleHighlight,description,workingHoursTitle,workingHours[]{_key,enabled,label,value,accent},form}`)
      .then((contactData) => {
        if (!active) return
        setSettings(contactData || {})
      })
      .catch((error) => {
        console.error("Sanity contact settings:", error)
        if (!active) return
        setSettings({})
      })
    return () => { active = false }
  }, [])

  const fallbackForm: FormCopy = {
    step: t?.form?.step,
    infoTitle: t?.form?.info_title,
    serviceTitle: t?.form?.service_title,
    fileTitle: t?.form?.file_title,
    nameLabel: t?.form?.labels?.name,
    companyLabel: t?.form?.labels?.company,
    emailLabel: t?.form?.labels?.email,
    phoneLabel: t?.form?.labels?.phone,
    serviceLabel: t?.form?.labels?.service,
    messageLabel: t?.form?.labels?.message,
    fileLabel: t?.form?.labels?.file,
    namePlaceholder: t?.form?.placeholders?.name,
    companyPlaceholder: t?.form?.placeholders?.company,
    emailPlaceholder: t?.form?.placeholders?.email,
    phonePlaceholder: t?.form?.placeholders?.phone,
    servicePlaceholder: t?.form?.placeholders?.service_default,
    messagePlaceholder: t?.form?.placeholders?.message,
    fileHint: t?.form?.placeholders?.file_hint,
    fileTypes: t?.form?.placeholders?.file_types,
    next: t?.form?.buttons?.next,
    prev: t?.form?.buttons?.prev,
    submit: t?.form?.buttons?.submit,
    success: t?.form?.success_msg,
    services: t?.services_list,
  }
  const f = { ...fallbackForm, ...(settings?.form?.[locale] || {}) }
  const badge = settings?.badge?.[locale] || t?.badge || "Contact"
  const title = settings?.title?.[locale] || t?.title || "Request a"
  const titleHighlight = settings?.titleHighlight?.[locale] || t?.title_highlight || "Quote"
  const description = settings?.description?.[locale] || t?.description || ""
  const hoursTitle = settings?.workingHoursTitle?.[locale] || t?.working_hours?.title || "Working Hours"
  const fallbackHours: WorkingHour[] = [
    { _key: "weekday", label: { [locale]: t?.working_hours?.monday_friday || "Monday - Friday" }, value: { common: "7:30 - 17:00" } },
    { _key: "saturday", label: { [locale]: t?.working_hours?.saturday || "Saturday" }, value: { common: "7:30 - 12:00" } },
    { _key: "sunday", label: { [locale]: t?.working_hours?.sunday || "Sunday" }, value: { [locale]: t?.working_hours?.closed || "Closed" }, accent: true },
  ]
  const workingHours = (settings?.workingHours?.length ? settings.workingHours : fallbackHours).filter((row) => row.enabled !== false && (row.value?.common || row.value?.[locale]))
  const visibleLocations: CompanyLocation[] = sharedLocations.length ? sharedLocations : (t?.offices || []).map((office: any, index: number) => ({ _key: `fallback-${index}`, enabled: true, kind: index === 0 ? "factory" : "office", name: { [locale]: office.name }, address: office.address }))

  const update = (name: string, value: string) => setFormData((prev) => ({ ...prev, [name]: value }))
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error(f.required || "Vui lòng điền đầy đủ các thông tin bắt buộc!")
      return
    }
    setIsSubmitting(true)
    const payload = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "file") { if (value instanceof File) payload.append(key, value) }
      else payload.append(key, String(value || ""))
    })
    try {
      const response = await fetch("/api/contact", { method: "POST", body: payload })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result?.error || "Submit failed")
      toast.success(f.success || "Cảm ơn bạn! Chúng tôi sẽ liên hệ trong 24 giờ.")
      setStep(1)
      setFormData({ name: "", company: "", email: "", phone: "", service: "", message: "", file: null })
    } catch (error) {
      console.error("Submit Error:", error)
      toast.error(f.error || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (settings?.enabled === false) return null

  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#f97316]/3 blur-[150px] rounded-full pointer-events-none" aria-hidden="true" />
      <div ref={ref} className="container mx-auto px-4 lg:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#f97316]" />
            <span className="text-[#f97316] text-sm font-medium uppercase tracking-widest">{badge}</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#f97316]" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">{title} <span className="italic text-[#f97316]">{titleHighlight}</span></h2>
          <p className="text-muted-foreground text-base lg:text-lg">{description}</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-2 space-y-6">
            {visibleLocations.map((location, index) => {
              const name = location.name?.[locale] || kindLabels[locale][location.kind || "other"]
              const mapHref = location.googleMapsUrl || (location.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}` : undefined)
              return (
                <div key={location._key || index} className="p-6 bg-card rounded-xl border border-border/50 hover:border-[#f97316]/30 transition-colors shadow-sm dark:shadow-none">
                  <h3 className="text-[14px] md:text-lg font-bold text-foreground mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#f97316]" />{name}</h3>
                  <div className="space-y-2 text-[12px] md:text-sm">
                    {mapHref ? <a href={mapHref} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-muted-foreground leading-relaxed hover:text-[#f97316] transition-colors">{location.address}<ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" /></a> : <p className="text-muted-foreground leading-relaxed">{location.address}</p>}
                    {phoneDisplay && phoneTel && <a href={`tel:${phoneTel}`} className="flex items-center gap-2 text-foreground/80 hover:text-[#f97316] transition-colors"><Phone className="w-4 h-4" />{phoneDisplay}</a>}
                    {email && <a href={`mailto:${email}`} className="flex items-center gap-2 text-foreground/80 hover:text-[#f97316] transition-colors"><Mail className="w-4 h-4" />{email}</a>}
                  </div>
                </div>
              )
            })}

            {workingHours.length > 0 && (
              <div className="p-6 bg-card rounded-xl border border-border/50 shadow-sm dark:shadow-none">
                <h3 className="text-[14px] md:text-lg font-bold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 md:w-5 md:h-5 text-[#f97316]" />{hoursTitle}</h3>
                <div className="space-y-2 text-[12px] md:text-sm">
                  {workingHours.map((row, index) => <div key={row._key || index} className="flex justify-between gap-4"><span className="text-muted-foreground">{row.label?.[locale]}</span><span className={row.accent ? "text-[#f97316]" : "text-foreground/80"}>{row.value?.common || row.value?.[locale]}</span></div>)}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }} className="lg:col-span-3">
            <div className="bg-card rounded-xl md:rounded-2xl border border-border/50 p-4 lg:p-8 shadow-xl shadow-black/5 dark:shadow-none">
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((s) => <React.Fragment key={s}><div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${step >= s ? "bg-[#f97316] text-white" : "bg-secondary text-muted-foreground"}`}>{s}</div>{s < 3 && <div className={`flex-1 max-w-24 h-0.5 mx-2 transition-colors ${step > s ? "bg-[#f97316]" : "bg-border/50"}`} />}</React.Fragment>)}
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <h3 className="font-serif text-xl font-bold text-foreground mb-6">{f.infoTitle}</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><Label htmlFor="name" className="text-foreground/80 text-[12px] md:text-sm">{f.nameLabel}</Label><Input id="name" name="name" value={formData.name} onChange={(e) => update("name", e.target.value)} placeholder={f.namePlaceholder} required className="h-9 md:h-10 text-[13px] md:text-sm bg-secondary border-border/50 text-foreground focus:border-[#f97316] px-3" /></div>
                        <div className="space-y-1.5"><Label htmlFor="company" className="text-foreground/80 text-[12px] md:text-sm">{f.companyLabel}</Label><Input id="company" name="company" value={formData.company} onChange={(e) => update("company", e.target.value)} placeholder={f.companyPlaceholder} className="h-9 md:h-10 text-[13px] md:text-sm bg-secondary border-border/50 text-foreground focus:border-[#f97316] px-3" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="email" className="text-foreground/80">{f.emailLabel}</Label><Input id="email" name="email" type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder={f.emailPlaceholder} required className="bg-secondary border-border/50 text-foreground focus:border-[#f97316]" /></div>
                        <div className="space-y-2"><Label htmlFor="phone" className="text-foreground/80">{f.phoneLabel}</Label><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder={f.phonePlaceholder} required className="bg-secondary border-border/50 text-foreground focus:border-[#f97316]" /></div>
                      </div>
                      <div className="flex justify-end pt-4"><Button type="button" onClick={() => setStep(2)} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold">{f.next}<ChevronRight className="w-4 h-4 ml-1" /></Button></div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <h3 className="font-serif text-xl font-bold text-foreground mb-6">{f.serviceTitle}</h3>
                      <div className="space-y-2"><Label htmlFor="service" className="text-foreground/80">{f.serviceLabel}</Label><select id="service" name="service" value={formData.service} onChange={(e) => update("service", e.target.value)} required className="w-full h-10 px-3 rounded-md bg-secondary border border-border/50 text-foreground focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]"><option value="">{f.servicePlaceholder}</option>{(f.services || []).map((service) => <option key={service} value={service}>{service}</option>)}</select></div>
                      <div className="space-y-2"><Label htmlFor="message" className="text-foreground/80">{f.messageLabel}</Label><Textarea id="message" name="message" value={formData.message} onChange={(e) => update("message", e.target.value)} placeholder={f.messagePlaceholder} rows={4} className="bg-secondary border-border/50 text-foreground focus:border-[#f97316] resize-none" /></div>
                      <div className="flex justify-between pt-4"><Button type="button" variant="outline" onClick={() => setStep(1)} className="border-border/50 hover:border-[#f97316]/50 bg-transparent text-foreground">{f.prev}</Button><Button type="button" onClick={() => setStep(3)} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold">{f.next}<ChevronRight className="w-4 h-4 ml-1" /></Button></div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <h3 className="font-serif text-xl font-bold text-foreground mb-6">{f.fileTitle}</h3>
                      <div className="space-y-2"><Label className="text-foreground/80">{f.fileLabel}</Label><div className="border-2 border-dashed border-border/50 hover:border-[#f97316]/50 rounded-xl p-8 text-center transition-colors cursor-pointer relative group"><input type="file" id="file" onChange={(e) => setFormData((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} className="absolute inset-0 opacity-0 cursor-pointer" /><Upload className="w-8 h-8 text-muted-foreground group-hover:text-[#f97316] mx-auto mb-3 transition-colors" /><p className="text-sm text-foreground/80">{formData.file?.name || f.fileHint}</p><p className="text-xs text-muted-foreground mt-1">{f.fileTypes}</p></div></div>
                      <div className="flex justify-between pt-4"><Button type="button" variant="outline" onClick={() => setStep(2)} className="border-border/50 hover:border-[#f97316]/50 bg-transparent text-foreground">{f.prev}</Button><Button type="submit" disabled={isSubmitting} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold">{isSubmitting ? "..." : f.submit}</Button></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
