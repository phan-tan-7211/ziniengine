
"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { ArrowRight, HardHat, Camera, Search, X } from "lucide-react"
import { FallbackBadge } from "./fallback-badge"
import { SmartPrefetchLink } from "./smart-prefetch-link"
import { motion, AnimatePresence } from "framer-motion"
import { CatalogSidebar, type CatalogFilterItem } from "./catalog-sidebar"

interface ProductListContentProps {
  danhSachSanPham: any[]
  danhSachDanhMuc: any[]
  lang: string
  dict: any
}

export function ProductListContent({ danhSachSanPham, danhSachDanhMuc, lang, dict }: ProductListContentProps) {
  const [activeCategoryId, setActiveCategoryId] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const filteredProducts = useMemo(() => {
    return danhSachSanPham.filter((sp) => {
      const matchesCategory = activeCategoryId === "all" || sp.serviceCategory?._id === activeCategoryId
      const matchesSearch = !searchQuery || 
        sp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sp.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategoryId, searchQuery, danhSachSanPham])
  const filterItems: CatalogFilterItem[] = [
    { id: "all", label: lang === "vi" ? "Tất cả" : "All" },
    ...danhSachDanhMuc.map((category) => ({ id: category._id, label: category.title })),
  ]


  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-40 -mx-4 mb-4 bg-background/95 px-4 pb-4 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:mx-0 md:px-0">
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-md mx-auto md:mx-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder={lang === 'vi' ? "Tìm kiếm sản phẩm..." : "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]/50 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
        <CatalogSidebar items={filterItems} activeId={activeCategoryId} onChange={setActiveCategoryId} ariaLabel={dict.navigation?.products} />
        <div className="min-w-0 flex-1">
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="col-span-full text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
            <HardHat className="mx-auto w-12 h-12 mb-4 text-[#334155] opacity-20" />
            <p className="text-muted-foreground font-medium">{lang === 'vi' ? 'Không tìm thấy sản phẩm phù hợp.' : 'No matching products found.'}</p>
            <button onClick={() => { setActiveCategoryId("all"); setSearchQuery("") }} className="mt-4 px-5 py-2 rounded-full text-sm font-medium bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 transition-colors">
              {lang === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'}
            </button>
          </motion.div>
        ) : (
          <motion.div key="grid" layout className="grid grid-cols-2 gap-3 landscape:grid-cols-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:landscape:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((sanPham) => (
                <motion.div key={sanPham._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, ease: "easeOut" }} className="h-full">
                  <SmartPrefetchLink
                    href={`/${lang}/products/${sanPham.slug}`}
                    aria-label={`Xem chi tiết sản phẩm: ${sanPham.title}`}
                    className="group block bg-card rounded-2xl md:rounded-3xl border border-border/50 overflow-hidden hover:border-[#f97316]/50 transition-all duration-500 hover:shadow-xl hover:shadow-[#f97316]/5 h-full flex flex-col"
                  >
                    <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-secondary/30">
                      {sanPham.image?.url ? (
                        <Image src={sanPham.image.url} alt={sanPham.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 767px) and (orientation: landscape) 33vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40">
                          <Camera className="w-10 h-10 mb-2 stroke-[1.5px]" />
                          <span className="text-[10px] uppercase tracking-widest font-medium">No Image</span>
                        </div>
                      )}

                      <div className="absolute left-2 top-2 z-20 max-w-[calc(100%_-_1rem)] md:left-3 md:top-3">
                        <span title={sanPham.serviceCategory?.title || "INDUSTRIAL"} className="block max-w-full truncate rounded-full border border-white/10 bg-background/60 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#f97316] shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-[#020617]/60 md:text-[11px]">
                          {sanPham.serviceCategory?.title || "INDUSTRIAL"}
                        </span>
                      </div>

                      <FallbackBadge ngonNguThucTe={sanPham.language} ngonNguNguoiDung={lang} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="p-3 md:p-5 flex flex-col flex-grow">
                      <h3 className="mb-1.5 line-clamp-2 text-[13px] font-bold leading-[1.35] text-foreground transition-colors group-hover:text-[#f97316] sm:text-sm md:mb-2 md:text-lg">{sanPham.title}</h3>
                      <p className="mb-3 line-clamp-2 flex-grow text-[11px] leading-5 text-muted-foreground md:mb-4 md:text-sm md:leading-relaxed">{sanPham.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/30">
                        <div className="flex min-w-0 items-center gap-1 text-[10px] font-bold text-[#f97316] sm:text-[11px] md:gap-1.5 md:text-sm">
                          <span>{dict.common?.read_more || "Chi tiết"}</span>
                          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/50 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <HardHat className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#f97316]" />
                        </div>
                      </div>
                    </div>
                  </SmartPrefetchLink>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
