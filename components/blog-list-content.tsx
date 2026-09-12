"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FallbackBadge } from "./fallback-badge"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt?: string
  mainImage?: { url?: string }
  publishedAt?: string
  category?: string
  author?: string
  readTime?: string
  language?: string
}

const localCopy: Record<string, { empty: string; author: string }> = {
  vi: { empty: 'Chưa có bài viết nào.', author: 'Ban biên tập' },
  en: { empty: 'No articles are available yet.', author: 'Editorial Team' },
  jp: { empty: '現在、記事はまだありません。', author: '編集チーム' },
  kr: { empty: '현재 등록된 글이 없습니다.', author: '편집팀' },
  cn: { empty: '目前暂无文章。', author: '编辑团队' },
}

export function BlogListContent({ posts, lang, dict }: { posts: BlogPost[]; lang: string; dict: any }) {
  const reduceMotion = useReducedMotion()
  const locale = lang === "vi" ? "vi-VN" : lang === "jp" ? "ja-JP" : lang === "kr" ? "ko-KR" : lang === "cn" ? "zh-CN" : "en-US"
  const copy = localCopy[lang] || localCopy.en

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 landscape:grid-cols-3 md:grid-cols-3 md:gap-5">
        {posts.map((post, index) => {
          const publishDate = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }) : ""
          return (
            <motion.article key={post._id} initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: Math.min(index * 0.05, 0.3) }} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all md:rounded-3xl lg:hover:-translate-y-2 lg:hover:scale-[1.015] lg:hover:border-primary/45 lg:hover:shadow-card">
              <FallbackBadge ngonNguThucTe={post.language || lang} ngonNguNguoiDung={lang} />
              <Link href={`/${lang}/blog/${post.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-secondary/20 md:aspect-[16/10]">
                <Image src={post.mainImage?.url || "/placeholder.svg"} alt={post.title} fill sizes="(max-width: 767px) and (orientation: landscape) 33vw, (max-width: 767px) 50vw, 33vw" className="object-cover transition-transform duration-700 lg:group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" aria-hidden="true" />
                <span title={post.category || "TECH"} className="absolute left-2 top-2 max-w-[calc(100%_-_1rem)] truncate rounded-full bg-primary px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-soft md:left-4 md:top-4 md:px-3 md:py-1.5 md:text-[10px]">{post.category || "TECH"}</span>
              </Link>

              <div className="flex flex-1 flex-col p-3 md:p-5 xl:p-6">
                <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-muted-foreground md:mb-4 md:text-xs">
                  {publishDate && <span className="flex items-center gap-1"><Calendar className="size-3 text-primary" aria-hidden="true" />{publishDate}</span>}
                  <span className="flex items-center gap-1"><Clock className="size-3 text-primary" aria-hidden="true" />{post.readTime || "5 min"}</span>
                </div>
                <Link href={`/${lang}/blog/${post.slug}`}><h2 className="line-clamp-2 text-balance font-serif text-[13px] font-bold leading-[1.35] text-foreground sm:text-sm md:text-lg xl:text-xl">{post.title}</h2></Link>
                <p className="mt-2 line-clamp-2 flex-1 text-[11px] leading-5 text-muted-foreground md:mt-3 md:line-clamp-3 md:text-sm md:leading-6">{post.excerpt || ""}</p>
                <div className="mt-4 flex items-center justify-between gap-1 border-t border-border/60 pt-3 md:mt-6 md:pt-4">
                  <div className="flex min-w-0 flex-1 items-center gap-1 text-[10px] text-muted-foreground md:text-sm"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary"><User className="size-3" aria-hidden="true" /></span><span className="truncate">{post.author || copy.author}</span></div>
                  <Link href={`/${lang}/blog/${post.slug}`} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-1 text-[10px] font-semibold text-primary md:min-h-11 md:text-sm">{dict.blog?.read_more || dict.common?.read_more}<ArrowRight className="size-3.5 md:size-4" aria-hidden="true" /></Link>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>

      {posts.length === 0 && <div className="rounded-3xl border border-dashed border-border bg-secondary/20 px-6 py-16 text-center"><p className="text-sm text-muted-foreground">{dict.blog?.empty || copy.empty}</p></div>}
    </div>
  )
}
