import { sanityClient } from "@/lib/sanity-client"

export type PageIdentifier = 'home' | 'about' | 'contact' | 'servicesHub' | 'productsHub' | string

export async function fetchSeoData(language: string, identifier: PageIdentifier) {
  return sanityClient.fetch(
    `coalesce(
      *[_type == "seoPageConfig" && pageIdentifier == $identifier && language == $language][0],
      *[_type == "seoPageConfig" && pageIdentifier == $identifier && language == "en"][0],
      *[_type == "seoPageConfig" && pageIdentifier == $identifier && language == "vi"][0]
    ) {
      metaTitle,
      metaDescription,
      openGraphImage {
        asset->{url, originalFilename}
      },
      heroHeading,
      mainContent
    }`,
    { language, identifier },
    { next: { revalidate: 60, tags: [`seo-page-${identifier}`] } },
  )
}
