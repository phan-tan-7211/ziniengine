import { BlueprintBackground } from "@/components/blueprint-background"
import { PortfolioListContent } from "@/components/portfolio-list-content"
import { PageHeader } from "@/components/page-header"
import { getDictionary } from "@/lib/get-dictionary"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { sanityClient } from "@/lib/sanity-client"
import { getPublicSiteUrl } from "@/lib/runtime-config"

async function layDuLieuPortfolio(lang: string) {
  const projectQuery = `*[_type == "project" && defined(slug.current) && !(_id in path("drafts.**"))] { _id,_translationKey,title,client,description,"slug":slug.current,language,"image":mainImage.asset->{url},"categoryIdentifier":coalesce(serviceCategory->_translationKey,serviceCategory->_id) }`
  const categoryQuery = `*[_type == "service" && defined(slug.current) && !(_id in path("drafts.**"))] | order(orderRank asc) { _id,_translationKey,language,title,orderRank }`
  const [rawProjects,rawCategories]=await Promise.all([sanityClient.fetch(projectQuery),sanityClient.fetch(categoryQuery)])

  const projectGroups:Record<string,any[]>={}
  rawProjects.forEach((project:any)=>{const key=project._translationKey||project._id;if(!projectGroups[key])projectGroups[key]=[];projectGroups[key].push(project)})
  const projects=Object.values(projectGroups).map((group:any[])=>group.find((item)=>item.language===lang)||group.find((item)=>item.language==="en")||group.find((item)=>item.language==="vi")||group[0])

  const categoryGroups:Record<string,any[]>={}
  rawCategories.forEach((category:any)=>{const key=category._translationKey||category._id;if(!categoryGroups[key])categoryGroups[key]=[];categoryGroups[key].push(category)})
  const categories=Object.entries(categoryGroups).map(([key,group])=>{const selected=group.find((item)=>item.language===lang)||group.find((item)=>item.language==="en")||group.find((item)=>item.language==="vi")||group[0];return selected?{_id:key,title:selected.title,orderRank:selected.orderRank||0}:null}).filter(Boolean).sort((a:any,b:any)=>a.orderRank-b.orderRank)
  return {projects,categories}
}

export async function generateMetadata({params}:{params:Promise<{lang:string}>}){
  const {lang}=await params
  const [dict,siteName]=await Promise.all([getDictionary(lang),getSiteName()])
  const title=withSiteName(dict.portfolio?.meta_title||dict.portfolio?.title||dict.navigation?.projects||"Projects",siteName)
  const description=dict.portfolio?.meta_desc||dict.portfolio?.description||""
  return {title:{absolute:title},description,alternates:{canonical:`/${lang}/portfolio`,languages:{"vi-VN":"/vi/portfolio","en-US":"/en/portfolio","ja-JP":"/jp/portfolio","ko-KR":"/kr/portfolio","zh-CN":"/cn/portfolio"}},openGraph:{title,description,url:`/${lang}/portfolio`,siteName},twitter:{card:"summary_large_image",title,description}}
}

export default async function PortfolioPage({params}:{params:Promise<{lang:string}>}){
  const {lang}=await params
  const [dict,data,siteName]=await Promise.all([getDictionary(lang),layDuLieuPortfolio(lang),getSiteName()])
  const siteUrl=getPublicSiteUrl()
  const jsonLd={"@context":"https://schema.org","@type":"ItemList",name:dict.portfolio?.title||`${siteName} Projects`,description:dict.portfolio?.description,itemListElement:data.projects.map((project:any,index:number)=>({"@type":"ListItem",position:index+1,url:`${siteUrl}/${lang}/portfolio/${project.slug}`,name:project.title,description:project.description,image:project.image?.url}))}
  return <main className="relative min-h-dvh bg-background text-foreground"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><div className="pointer-events-none absolute inset-0 z-0 opacity-25 dark:opacity-45" aria-hidden="true"><BlueprintBackground/></div><div className="relative z-10"><PageHeader title={dict.portfolio?.title} description={dict.portfolio?.description} subtitle={dict.portfolio?.subtitle} lang={lang} dict={dict}/><section className="relative z-10 pb-24 sm:pb-28 lg:pb-32"><PortfolioListContent projects={data.projects} categories={data.categories as any} lang={lang} dict={dict}/></section></div></main>
}
