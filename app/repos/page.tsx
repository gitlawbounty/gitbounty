'use client'

import { useEffect, useRef, useState } from 'react'
import { useRepos } from '@/hooks/useRepos'
import { useNetworkStats } from '@/hooks/useNetworkStats'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ReposPage() {
  const { data, isLoading, error } = useRepos()
  const { data: stats } = useNetworkStats()
  const [search, setSearch] = useState('')

  const repos = data?.repos ?? []
  const filtered = search
    ? repos.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.owner.toLowerCase().includes(search.toLowerCase()) ||
          (r.description ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : repos

  // Track repos seen on previous poll → flag NEW
  const seen = useRef<Set<string>>(new Set())
  const [, forceRender] = useState(0)
  const fresh = new Set<string>()
  const isFirst = seen.current.size === 0
  for (const r of repos) {
    const key = `${r.owner}/${r.name}`
    if (!seen.current.has(key)) {
      seen.current.add(key)
      if (!isFirst) fresh.add(key)
    }
  }
  useEffect(() => {
    if (fresh.size > 0) {
      const t = setTimeout(() => forceRender((n) => n + 1), 15_000)
      return () => clearTimeout(t)
    }
  }, [fresh.size])

  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/repos" />

          <section className="pt-12 pb-8 max-w-3xl">
            <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05]">
              <span className="text-accent">{stats?.totalRepos?.toLocaleString() ?? '…'}</span> repos
              <br />on the gitlawb network.
            </h1>
            <p className="mt-4 text-sm text-muted max-w-2xl leading-relaxed">
              all repos discoverable via node.gitlawb.com · sorted by most recently updated ·
              refreshes every 10s · new pushes flash with a NEW badge
            </p>
          </section>
        </main>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="text-xs text-muted">
          <span className="text-accent">$</span> gl repo list --sort=updated --network
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="filter by repo name, did, or description..."
          className="w-full bg-transparent border-b border-border focus:border-accent outline-none px-2 py-2 text-sm"
        />

        {isLoading ? (
          <BlinkingCursor label="$ aggregating repos" />
        ) : error ? (
          <EmptyState>error loading repos · {String(error).slice(0, 80)}</EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>no repos match filter</EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.slice(0, 100).map((r) => {
              const key = `${r.owner}-${r.name}`
              const isNew = fresh.has(`${r.owner}/${r.name}`)
              return (
                <a
                  key={key}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block border rounded-lg p-4 transition group ${
                    isNew
                      ? 'bg-accent/5 border-accent/60'
                      : 'bg-surface/40 hover:bg-surface border-border hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted truncate flex items-center gap-2">
                        <span>{r.owner.slice(0, 12)}…</span>
                        {isNew && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-accent text-base font-semibold animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-base text-primary group-hover:text-accent mt-1 truncate">
                        {r.name}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {r.bountyCount > 0 ? (
                        <>
                          <div className="text-xs text-accent font-semibold">{r.bountyCount}</div>
                          <div className="text-[9px] text-muted uppercase tracking-[0.15em]">
                            bounties
                          </div>
                        </>
                      ) : r.starCount && r.starCount > 0 ? (
                        <>
                          <div className="text-xs text-muted">★ {r.starCount}</div>
                          <div className="text-[9px] text-muted/70 uppercase tracking-[0.15em]">
                            stars
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {r.description && (
                    <p className="mt-2 text-[11px] text-muted line-clamp-2 leading-snug">
                      {r.description}
                    </p>
                  )}
                  <div className="mt-2 text-[10px] text-muted/70 flex items-center gap-2">
                    {r.bountyCount > 0 && (
                      <>
                        <span>Σ {r.totalReward.toLocaleString()} $GITLAWB</span>
                        <span>·</span>
                      </>
                    )}
                    <span>updated {r.updatedAgo ?? r.latestBountyAge ?? '—'}</span>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {filtered.length > 100 && (
          <div className="text-center text-xs text-muted py-3">
            showing 100 of {filtered.length.toLocaleString()} · refine search to narrow
          </div>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
