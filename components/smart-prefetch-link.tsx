"use client"

import Link from "next/link"
import type { ComponentProps, FocusEvent, MouseEvent, PointerEvent } from "react"
import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"

const prefetchedAt = new Map<string, number>()
const PREFETCH_TTL_MS = 60 * 1000
const MAX_VIEWPORT_PREFETCH_PER_PAGE = 8
let budgetPathname = ""
let viewportPrefetchCount = 0

type SmartPrefetchLinkProps = ComponentProps<typeof Link> & {
  intentDelayMs?: number
  viewportPrefetch?: boolean
}

function shouldPrefetch() {
  if (typeof navigator === "undefined") return false
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (connection?.saveData) return false
  if (connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") return false
  return true
}

function isFreshPrefetch(href: string) {
  const timestamp = prefetchedAt.get(href)
  if (!timestamp) return false
  if (Date.now() - timestamp <= PREFETCH_TTL_MS) return true
  prefetchedAt.delete(href)
  return false
}

function claimViewportBudget(pathname: string) {
  if (budgetPathname !== pathname) {
    budgetPathname = pathname
    viewportPrefetchCount = 0
  }
  if (viewportPrefetchCount >= MAX_VIEWPORT_PREFETCH_PER_PAGE) return false
  viewportPrefetchCount += 1
  return true
}

export function SmartPrefetchLink({
  href,
  intentDelayMs = 55,
  viewportPrefetch = true,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onPointerDown,
  prefetch = false,
  ...props
}: SmartPrefetchLinkProps) {
  const router = useRouter()
  const pathname = usePathname()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const anchorRef = useRef<HTMLAnchorElement | null>(null)
  const hrefString = typeof href === "string" ? href : href.pathname || ""
  const eagerPrefetch = prefetch === true

  const prefetchNow = () => {
    if (!hrefString.startsWith("/") || !shouldPrefetch() || isFreshPrefetch(hrefString)) return
    router.prefetch(hrefString)
    prefetchedAt.set(hrefString, Date.now())
  }

  const schedulePrefetch = () => {
    if (!hrefString.startsWith("/") || !shouldPrefetch() || isFreshPrefetch(hrefString)) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      prefetchNow()
    }, intentDelayMs)
  }

  const cancelScheduledPrefetch = () => {
    if (!timerRef.current) return
    clearTimeout(timerRef.current)
    timerRef.current = null
  }

  useEffect(() => cancelScheduledPrefetch, [])

  useEffect(() => {
    if (!eagerPrefetch || !hrefString.startsWith("/") || !shouldPrefetch() || isFreshPrefetch(hrefString)) return
    const timer = window.setTimeout(prefetchNow, 0)
    return () => window.clearTimeout(timer)
  }, [eagerPrefetch, hrefString])

  useEffect(() => {
    if (eagerPrefetch || !viewportPrefetch || !hrefString.startsWith("/") || !shouldPrefetch() || isFreshPrefetch(hrefString)) return
    const node = anchorRef.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (isFreshPrefetch(hrefString) || !claimViewportBudget(pathname)) {
          observer.disconnect()
          return
        }

        const schedule = (window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback
        if (schedule) schedule(prefetchNow, { timeout: 350 })
        else window.setTimeout(prefetchNow, 35)
        observer.disconnect()
      },
      { rootMargin: "500px 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [eagerPrefetch, hrefString, pathname, viewportPrefetch])

  return (
    <Link
      {...props}
      ref={anchorRef}
      href={href}
      prefetch={false}
      onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
        schedulePrefetch()
        onMouseEnter?.(event)
      }}
      onMouseLeave={(event: MouseEvent<HTMLAnchorElement>) => {
        cancelScheduledPrefetch()
        onMouseLeave?.(event)
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        prefetchNow()
        onFocus?.(event)
      }}
      onPointerDown={(event: PointerEvent<HTMLAnchorElement>) => {
        prefetchNow()
        onPointerDown?.(event)
      }}
    />
  )
}
