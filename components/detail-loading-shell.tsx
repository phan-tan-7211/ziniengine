export function DetailLoadingShell() {
  return (
    <main className="min-h-dvh bg-background text-foreground" aria-busy="true" aria-live="polite">
      <section className="content-shell pb-24 pt-32 sm:pt-36 lg:pb-28 lg:pt-40">
        <div className="animate-pulse">
          <div className="mb-8 flex gap-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="aspect-[4/3] w-full rounded-[var(--radius-card)] bg-muted sm:aspect-video" />
            </div>

            <div className="space-y-5 lg:col-span-5">
              <div className="h-6 w-28 rounded-full bg-muted" />
              <div className="h-12 w-11/12 rounded bg-muted sm:h-14" />
              <div className="h-12 w-8/12 rounded bg-muted sm:h-14" />
              <div className="space-y-3 pt-2">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-11/12 rounded bg-muted" />
                <div className="h-4 w-9/12 rounded bg-muted" />
              </div>
              <div className="flex gap-3 pt-4">
                <div className="h-11 w-32 rounded-xl bg-muted" />
                <div className="h-11 w-28 rounded-xl bg-muted" />
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-32 rounded-2xl bg-muted" />
            <div className="h-32 rounded-2xl bg-muted" />
            <div className="h-32 rounded-2xl bg-muted" />
          </div>
        </div>
      </section>
    </main>
  )
}
