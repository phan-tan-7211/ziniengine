import { ProductHero } from "@/components/product-hero"
import { Footer } from "@/components/footer"
import { BlueprintBackground } from "@/components/blueprint-background"
import { HardHat } from "lucide-react"
import { getDictionary } from "@/lib/get-dictionary"
import { getSiteName, withSiteName } from "@/lib/site-settings"
import { ProductListContent } from "@/components/product-list-content"
import { sanityClient } from "@/lib/sanity-client"
import { getPublicSiteUrl } from "@/lib/runtime-config"

const emptyProductMessages: Record<string, string> = {
  vi: 'Hiện chưa có sản phẩm nào. Dữ liệu đang được cập nhật.',
  en: 'No products are available yet. Content is being updated.',
  jp: '現在、製品はまだ登録されていません。内容を更新中です。',
  kr: '현재 등록된 제품이 없습니다. 콘텐츠를 업데이트 중입니다.',
  cn: '目前暂无产品。内容正在更新中。',
}

async function layDanhSachSanPham(ngonNguHienTai: string) {
  return sanityClient.fetch(`
    *[_type == "product" && language == $ngonNguHienTai && defined(slug.current) && !(_id in path("drafts.**"))] | order(_createdAt desc) {
      _id,
      _translationKey,
      title,
      description,
      "slug": slug.current,
      language,
      "image": image.asset->{ url },
      "serviceCategory": serviceCategory->{ _id, title }
    }
  `, { ngonNguHienTai })
}

async function layDanhSachDanhMuc(ngonNguHienTai: string) {
  return sanityClient.fetch(`
    *[_type == "service" && language == $ngonNguHienTai && defined(slug.current) && !(_id in path("drafts.**"))] {
      _id,
      title,
      language,
      _translationKey
    }
  `, { ngonNguHienTai })
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dictionary, siteName] = await Promise.all([getDictionary(lang), getSiteName()])
  const title = withSiteName(dictionary.products?.meta_title || dictionary.navigation?.products || "Products", siteName)
  const description = dictionary.products?.meta_desc || dictionary.products?.hub_description || ""

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${lang}/products`,
      languages: {
        'vi-VN': '/vi/products',
        'en-US': '/en/products',
        'ja-JP': '/jp/products',
        'ko-KR': '/kr/products',
        'zh-CN': '/cn/products',
      },
    },
    openGraph: { title, description, url: `/${lang}/products`, siteName },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ProductsListPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const [dictionary, danhSachSanPham, danhSachDanhMuc, siteName] = await Promise.all([
    getDictionary(lang),
    layDanhSachSanPham(lang),
    layDanhSachDanhMuc(lang),
    getSiteName(),
  ])
  const siteUrl = getPublicSiteUrl()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": dictionary.products?.title_main || `${siteName} Products`,
    "description": dictionary.products?.hub_description,
    "itemListElement": danhSachSanPham.map((sp: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${siteUrl}/${lang}/products/${sp.slug}`,
      "name": sp.title,
      "description": sp.description,
      "image": sp.image?.url
    }))
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-10 pointer-events-none"><BlueprintBackground /></div>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />

      <section className="pt-32 md:pt-44 pb-16 relative z-10">
        <ProductHero
          titleMain={dictionary.products?.title_main}
          titleHighlight={dictionary.products?.title_highlight}
          description={dictionary.products?.hub_description}
        />
      </section>

      <section className="pb-32 relative z-10">
        {danhSachSanPham.length === 0 ? (
          <div className="container mx-auto px-4">
            <div className="text-center text-muted-foreground py-20 bg-card/50 rounded-3xl border border-dashed border-border">
              <HardHat className="mx-auto w-12 h-12 mb-4 text-[#334155] opacity-20" />
              {emptyProductMessages[lang] || emptyProductMessages.en}
            </div>
          </div>
        ) : (
          <ProductListContent danhSachSanPham={danhSachSanPham} danhSachDanhMuc={danhSachDanhMuc} lang={lang} dict={dictionary} />
        )}
      </section>

      <Footer lang={lang} dict={dictionary} />
    </main>
  )
}
