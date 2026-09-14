import { ProductHero } from "@/components/product-hero"
import { CatalogSidebar } from "@/components/catalog-sidebar"
import { BlueprintBackground } from "@/components/blueprint-background"
import { HardHat } from "lucide-react"
import { getDictionary } from "@/lib/get-dictionary-cached"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { ProductListContent } from "@/components/product-list-content"
import { sanityClient } from "@/lib/sanity-client"
import { getPublicSiteUrl } from "@/lib/runtime-config"
import { getLocalizedServiceCatalog, getProductServiceCategories } from "@/lib/service-catalog"

const emptyProductMessages: Record<string,string> = {vi:'Hiện chưa có sản phẩm nào. Dữ liệu đang được cập nhật.',en:'No products are available yet. Content is being updated.',jp:'現在、製品はまだ登録されていません。内容を更新中です。',kr:'현재 등록된 제품이 없습니다. 콘텐츠를 업데이트 중입니다.',cn:'目前暂无产品。内容正在更新中。'}

async function layDanhSachSanPham(ngonNguHienTai:string){
  const all:any[]=await sanityClient.fetch(`*[_type == "product" && defined(slug.current) && !(_id in path("drafts.**"))] | order(_createdAt desc) {_id,_translationKey,title,description,"slug":slug.current,language,"image":image.asset->{url},"serviceCategory":serviceCategory->{_id,title}}`)
  const groups:Record<string,any[]>={}
  all.forEach((item)=>{const key=item._translationKey||item._id;if(!groups[key])groups[key]=[];groups[key].push(item)})
  return Object.values(groups).map((group)=>group.find((v)=>v.language===ngonNguHienTai)||group.find((v)=>v.language==='en')||group.find((v)=>v.language==='vi')||group[0])
}

export async function generateMetadata({params}:{params:Promise<{lang:string}>}){
  const {lang}=await params
  const [dictionary,siteName]=await Promise.all([getDictionary(lang),getSiteName()])
  const title=withSiteName(dictionary.products?.meta_title||dictionary.navigation?.products||"Products",siteName)
  const description=dictionary.products?.meta_desc||dictionary.products?.hub_description||""
  return {title:{absolute:title},description,alternates:{canonical:`/${lang}/products`,languages:{'vi-VN':'/vi/products','en-US':'/en/products','ja-JP':'/jp/products','ko-KR':'/kr/products','zh-CN':'/cn/products'}},openGraph:{title,description,url:`/${lang}/products`,siteName},twitter:{card:'summary_large_image',title,description}}
}

export default async function ProductsListPage({params}:{params:Promise<{lang:string}>}){
  const {lang}=await params
  const [dictionary,danhSachSanPham,danhSachDanhMuc,serviceItems,siteName]=await Promise.all([getDictionary(lang),layDanhSachSanPham(lang),getProductServiceCategories(lang),getLocalizedServiceCatalog(lang),getSiteName()])
  const siteUrl=getPublicSiteUrl()
  const jsonLd={"@context":"https://schema.org","@type":"ItemList","name":dictionary.products?.title_main||`${siteName} Products`,"description":dictionary.products?.hub_description,"itemListElement":danhSachSanPham.map((sp:any,index:number)=>({"@type":"ListItem","position":index+1,"url":`${siteUrl}/${lang}/products/${sp.slug}`,"name":sp.title,"description":sp.description,"image":sp.image?.url}))}
  return <main className="min-h-screen bg-background text-foreground relative"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><div className="absolute inset-0 z-0 opacity-50 dark:opacity-10 pointer-events-none"><BlueprintBackground/></div><div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{backgroundImage:`linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)`,backgroundSize:'100px 100px'}}/><section className="pt-32 md:pt-44 pb-16 relative z-10"><ProductHero titleMain={dictionary.products?.title_main} titleHighlight={dictionary.products?.title_highlight} description={dictionary.products?.hub_description}/></section><section className="pb-32 relative z-10">{danhSachSanPham.length===0?<div className="container mx-auto px-4"><div className="text-center text-muted-foreground py-20 bg-card/50 rounded-3xl border border-dashed border-border"><HardHat className="mx-auto w-12 h-12 mb-4 text-[#334155] opacity-20"/>{emptyProductMessages[lang]||emptyProductMessages.en}</div></div>:<div className="mx-auto flex max-w-7xl items-start gap-4 lg:gap-6"><CatalogSidebar lang={lang} dict={dictionary} active="products" serviceItems={serviceItems}/><div className="min-w-0 flex-1"><ProductListContent danhSachSanPham={danhSachSanPham} danhSachDanhMuc={danhSachDanhMuc} lang={lang} dict={dictionary}/></div></div>}</section></main>
}
