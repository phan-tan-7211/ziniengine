"use client"

import Link from "next/link"
import type { ComponentProps, FocusEvent, MouseEvent, PointerEvent } from "react"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const prefetchedUrls = new Set<string>()
let viewportPrefetchCount = 0
const MAX_VIEWPORT_PREFETCH = 8

type SmartPrefetchLinkProps = ComponentProps<typeof Link> & {
  intentDelayMs?: number
  viewportPrefetch?: boolean
}

function shouldPrefetch() {
  if (typeof navigator === "undefined") return false

  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection

  if (connection?.saveData) return false
  if (connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") return false

  return true
}

export function SmartPrefetchLink({
  href,
  intentDelayMs = 70,
  viewportPrefetch = true,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onPointerDown,
  prefetch = true,
  ...props
}: SmartPrefetchLinkProps) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const anchorRef = useRef<HTMLAnchorElement | null>(null)
  const hrefString = typeof href === "string" ? href : href.pathname || ""

  const prefetchNow = () => {
    if (!hrefString || !shouldPrefetch() || prefetchedUrls.has(hrefString)) return
    prefetchedUrls.add(hrefString)
    router.prefetch(hrefString)
  }

  const schedulePrefetch = () => {
    if (!hrefString || !shouldPrefetch() || prefetchedUrls.has(hrefString)) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(prefetchNow, intentDelayMs)
  }

  const cancelScheduledPrefetch = () => {
    if (!timerRef.current) return
    clearTimeout(timerRef.current)
    timerRef.current = null
  }

  useEffect(() => {
    if (!viewportPrefetch || !hrefString || !shouldPrefetch() || prefetchedUrls.has(hrefString)) return
    if (viewportPrefetchCount >= MAX_VIEWPORT_PREFETCH) return
    const node = anchorRef.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (viewportPrefetchCount >= MAX_VIEWPORT_PREFETCH || prefetchedUrls.has(hrefString)) {
          observer.disconnect()
          return
        }
        viewportPrefetchCount += 1
        const schedule = (window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback
        if (schedule) schedule(prefetchNow, { timeout: 500 })
        else window.setTimeout(prefetchNow, 50)
        observer.disconnect()
      },
      { rootMargin: "600px 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hrefString, viewportPrefetch])

  return (
    <Link
      {...props}
      ref={anchorRef}
      href={href}
      prefetch={prefetch}
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
