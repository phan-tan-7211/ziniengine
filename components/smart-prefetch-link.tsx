"use client"

import Link from "next/link"
import type { ComponentProps, FocusEvent, MouseEvent, PointerEvent } from "react"
import { useRef } from "react"
import { useRouter } from "next/navigation"

const prefetchedUrls = new Set<string>()

type SmartPrefetchLinkProps = ComponentProps<typeof Link> & {
  intentDelayMs?: number
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
  intentDelayMs = 90,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onPointerDown,
  prefetch = false,
  ...props
}: SmartPrefetchLinkProps) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  return (
    <Link
      {...props}
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
