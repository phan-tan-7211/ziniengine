import { BlueprintBackground } from "@/components/blueprint-background"
import { CatalogSidebar } from "@/components/catalog-sidebar"
import { PageHeader } from "@/components/page-header"
import { ServiceListContent } from "@/components/service-list-content"
import { getDictionary } from "@/lib/get-dictionary-cached"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { getPublicSiteUrl } from "@/lib/runtime-config"
import { getLocalizedServiceCatalog } from "@/lib/service-catalog"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, siteName] = await Promise.all([getDictionary(lang), getSiteName()])
  const title = withSiteName(dict.services?.meta_title || dict.navigation?.services || "Services", siteName)
  const description = dict.services?.meta_desc || dict.services?.hub_description || ""
  return { title:{absolute:title}, description, alternates:{canonical:`/${lang}/services`,languages:{"vi-VN":"/vi/services","en-US":"/en/services","ja-JP":"/jp/services","ko-KR":"/kr/services","zh-CN":"/cn/services"}}, openGraph:{title,description,url:`/${lang}/services`,siteName}, twitter:{card:"summary",title,description} }
}

export default async function ServicesHubPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dict, services, siteName] = await Promise.all([getDictionary(lang), getLocalizedServiceCatalog(lang), getSiteName()])
  const siteUrl = getPublicSiteUrl()
  const titleMain = dict.services?.title_main || dict.navigation?.services || "Services"
  const titleHighlight = dict.services?.title_highlight || ""
  const pageTitle = `${titleMain} ${titleHighlight}`.trim()
  const description = dict.services?.hub_description || ""
  const jsonLd={"@context":"https://schema.org","@type":"ItemList",name:dict.services?.meta_title||`${siteName} Services`,description:dict.services?.meta_desc||description,itemListElement:services.map((service:any,index:number)=>({"@type":"ListItem",position:index+1,url:`${siteUrl}/${lang}/services/${service.slug}`,name:service.title,description:service.description}))}
  return <div className="relative min-h-dvh overflow-x-clip bg-background text-foreground"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><div className="pointer-events-none absolute inset-0 z-0 opacity-20 dark:opacity-35" aria-hidden="true"><BlueprintBackground/></div><div className="relative z-10"><PageHeader title={pageTitle} subtitle={dict.navigation?.services} description={description} lang={lang} dict={dict}/><section className="section-space" aria-label={dict.navigation?.services}><div className="mx-auto flex max-w-7xl items-start gap-4 lg:gap-6"><CatalogSidebar lang={lang} dict={dict} active="services" serviceItems={services}/><div className="min-w-0 flex-1"><ServiceListContent danhSachDichVu={services} lang={lang} dict={dict}/></div></div></section></div></div>
}
