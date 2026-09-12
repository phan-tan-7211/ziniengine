import vi from '../../dictionaries/vi.json'
import en from '../../dictionaries/en.json'
import jp from '../../dictionaries/jp.json'
import kr from '../../dictionaries/kr.json'
import cn from '../../dictionaries/cn.json'

export const COMPANY_BOOTSTRAP_VERSION = 1
export const COMPANY_BOOTSTRAP_API_VERSION = '2024-01-01'

type LocaleKey = 'vi' | 'en' | 'jp' | 'kr' | 'cn'
type Dictionary = Record<string, any>

const dictionaries: Record<LocaleKey, Dictionary> = { vi, en, jp, kr, cn }
const locales = Object.keys(dictionaries) as LocaleKey[]

// Keep legacy compatibility explicit. Do not infer the legacy company from arbitrary
// words inside dictionaries (e.g. the generic word "company"), because that can
// accidentally enable ZINITEK content for a brand-new white-label project.
const LEGACY_COMPANY_BRANDS = new Set(['zinitek'])

export function legacyDictionaryMatchesBrand(siteName: string) {
  const normalized = siteName.trim().toLocaleLowerCase().replace(/\s+/g, '')
  return LEGACY_COMPANY_BRANDS.has(normalized)
}

function safeIdPart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-')
}

function localized(path: string): Record<LocaleKey, string> {
  const parts = path.split('.')
  return locales.reduce((output, locale) => {
    let value: any = dictionaries[locale]
    for (const part of parts) value = value?.[part]
    output[locale] = typeof value === 'string' ? value : ''
    return output
  }, {} as Record<LocaleKey, string>)
}

function mapContactForm(locale: LocaleKey) {
  const contactSection = dictionaries[locale]?.contact_section || {}
  const form = contactSection.form || {}
  return {
    step: form.step || '',
    infoTitle: form.info_title || '',
    serviceTitle: form.service_title || '',
    fileTitle: form.file_title || '',
    nameLabel: form.labels?.name || '',
    companyLabel: form.labels?.company || '',
    emailLabel: form.labels?.email || '',
    phoneLabel: form.labels?.phone || '',
    serviceLabel: form.labels?.service || '',
    messageLabel: form.labels?.message || '',
    fileLabel: form.labels?.file || '',
    namePlaceholder: form.placeholders?.name || '',
    companyPlaceholder: form.placeholders?.company || '',
    emailPlaceholder: form.placeholders?.email || '',
    phonePlaceholder: form.placeholders?.phone || '',
    servicePlaceholder: form.placeholders?.service_default || '',
    messagePlaceholder: form.placeholders?.message || '',
    fileHint: form.placeholders?.file_hint || '',
    fileTypes: form.placeholders?.file_types || '',
    next: form.buttons?.next || '',
    prev: form.buttons?.prev || '',
    submit: form.buttons?.submit || '',
    success: form.success_msg || '',
    services: Array.isArray(contactSection.services_list) ? contactSection.services_list : [],
  }
}

export function buildPageContentSeedDocuments() {
  return locales.flatMap((locale) =>
    Object.entries(dictionaries[locale]).map(([key, value]) => ({
      _id: `pageContent.${locale}.${safeIdPart(key)}`,
      _type: 'pageContent',
      language: locale,
      key,
      content: JSON.stringify(value, null, 2),
    })),
  )
}

export function buildContactSettingsSeed() {
  return {
    _id: 'contactSettings',
    _type: 'contactSettings',
    enabled: true,
    badge: localized('contact_section.badge'),
    title: localized('contact_section.title'),
    titleHighlight: localized('contact_section.title_highlight'),
    description: localized('contact_section.description'),
    workingHoursTitle: localized('contact_section.working_hours.title'),
    workingHours: [
      {
        _key: 'weekday',
        enabled: true,
        label: localized('contact_section.working_hours.monday_friday'),
        value: { common: '7:30 - 17:00' },
        accent: false,
      },
      {
        _key: 'saturday',
        enabled: true,
        label: localized('contact_section.working_hours.saturday'),
        value: { common: '7:30 - 12:00' },
        accent: false,
      },
      {
        _key: 'sunday',
        enabled: true,
        label: localized('contact_section.working_hours.sunday'),
        value: {
          vi: dictionaries.vi.contact_section?.working_hours?.closed || '',
          en: dictionaries.en.contact_section?.working_hours?.closed || '',
          jp: dictionaries.jp.contact_section?.working_hours?.closed || '',
          kr: dictionaries.kr.contact_section?.working_hours?.closed || '',
          cn: dictionaries.cn.contact_section?.working_hours?.closed || '',
        },
        accent: true,
      },
    ],
    form: {
      vi: mapContactForm('vi'),
      en: mapContactForm('en'),
      jp: mapContactForm('jp'),
      kr: mapContactForm('kr'),
      cn: mapContactForm('cn'),
    },
  }
}

export function buildLocationSettingsSeed() {
  const firstOfficeByLocale = locales.reduce((output, locale) => {
    const office = dictionaries[locale]?.contact_section?.offices?.[0]
    output[locale] = typeof office?.name === 'string' ? office.name : ''
    return output
  }, {} as Record<LocaleKey, string>)
  const canonicalOffice = dictionaries.vi?.contact_section?.offices?.[0]

  return {
    _id: 'locationsSettings',
    _type: 'locationsSettings',
    locations: canonicalOffice?.address
      ? [
          {
            _key: 'legacy-primary-location',
            enabled: true,
            kind: 'factory',
            name: firstOfficeByLocale,
            address: canonicalOffice.address,
          },
        ]
      : [],
  }
}
