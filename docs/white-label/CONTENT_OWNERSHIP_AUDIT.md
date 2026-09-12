# White-label content ownership audit

Status: in progress on `audit/white-label-hardening`.

## Safety rule

The existing ZINITEK Sanity project (`g4o3uumy / production`) is the preservation source. White-label cleanup must never delete or overwrite its company data. New-company behavior is tested with a separate Sanity project/dataset.

## Ownership model

### Framework/code

Keep only reusable behavior and UI/system strings here:

- routing, layouts, components and interactions
- form validation and technical error states
- locale selection and i18n merge logic
- generic empty states such as "No projects yet"
- design-system defaults
- migration compatibility code that is explicitly gated to the legacy company

### Sanity/company data

Company-specific content belongs in Sanity:

- company name, logo, tagline and visual brand settings
- hero/about/marketing copy
- services, products, projects and blog content
- contact details, offices, working hours and social links
- SEO content
- testimonials/reviews
- statistics, certifications and capabilities
- legal/company-specific footer copy

### ENV/infrastructure

Keep deployment/infrastructure configuration outside the CMS:

- Sanity project ID and dataset
- site URL
- API version
- secrets and server-side recipients

## Important bug found during clone test

`legacyDictionaryMatchesBrand()` previously checked whether the current brand text appeared anywhere inside the bundled legacy dictionaries.

That made the neutral fallback brand `COMPANY` incorrectly match the generic word `company` inside the English legacy dictionary, which enabled the entire ZINITEK legacy dictionary in a brand-new Sanity project.

The hardening branch changes this to an explicit legacy-brand allowlist (`zinitek`) so `COMPANY` and future customers cannot activate ZINITEK compatibility accidentally.

## Runtime leaks identified

### Fixed/gated in this branch

- legacy dictionary activation for generic `COMPANY`
- ZINITEK-specific hero text fallback
- ZINITEK achievement stats hidden when company stats labels are absent
- hard-coded sample featured projects (Toyota Boshoku / Vietnam Airlines Technical / Samsung Electronics) are now legacy-gated only
- About page metadata/JSON-LD no longer hardcodes `zinitek.vn` or ZINITEK fallback text
- Contact page metadata/JSON-LD no longer hardcodes `zinitek.vn` or ZINITEK fallback text
- new Google Reviews documents no longer start with fake ZINITEK reviews or ZINITEK-branded copy

### Existing legacy content that is already designed to seed/mirror into Sanity

`sanity/bootstrap/legacyDictionaryBootstrap.ts` already creates `pageContent` documents from all bundled locale dictionaries for the legacy company only. It also seeds contact and location settings without overwriting existing values.

This mechanism is intentionally retained until ZINITEK content has been fully verified in Sanity.

### Remaining legacy compatibility to inventory/migrate before deletion

- hero numeric achievements (500+, 10+, 100%, 50+) are still code-level legacy values, now hidden for non-legacy companies
- the three old homepage sample project cards are still code-level legacy data, now hidden for non-legacy companies
- legacy browser translation key `zinitekTranslations` remains for compatibility
- legacy color preset alias `zinitekOrange` remains mapped to generic `brandOrange`
- repository docs/agent instructions may still mention ZINITEK; these are not runtime customer content

Do not delete these compatibility paths until ZINITEK production has equivalent Sanity data and regression tests pass.

## Required verification before merge

### ZINITEK preservation test (`g4o3uumy`)

- `/vi`, `/en`, `/jp`, `/kr`, `/cn`
- `/about`, `/services`, `/products`, `/portfolio`, `/blog`, `/contact`
- header/logo/footer/contact data unchanged
- homepage hero/stats/projects unchanged
- Studio and Company Data Manager still work
- `npm run build` passes

### New-company isolation test (`kju2cd0k` or another blank project)

- brand renders as `COMPANY` or configured company name
- no ZINITEK marketing copy
- no ZINITEK addresses/contact details
- no ZINITEK stats/certifications
- no Toyota Boshoku / Vietnam Airlines Technical / Samsung Electronics sample cards
- no fake reviews
- empty collections show neutral empty states
- metadata/JSON-LD use the configured site URL and company name

Only after both sides pass should the hardening branch be merged and deeper legacy cleanup continue.
