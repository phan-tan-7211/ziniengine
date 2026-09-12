"use client"

import React, { createContext, useContext } from "react"
import type { GlobalSiteSettings } from "@/lib/site-settings"

export interface SharedCompanyLocation {
  _key?: string
  enabled?: boolean
  kind?: "factory" | "office" | "factory_office" | "other"
  name?: Partial<Record<"vi" | "en" | "jp" | "kr" | "cn", string>>
  address?: string
  googleMapsUrl?: string
}

export interface SiteSettings extends GlobalSiteSettings {
  sharedLocations?: SharedCompanyLocation[]
}

const SiteSettingsContext = createContext<SiteSettings>({})

export function SiteSettingsProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={value || {}}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
