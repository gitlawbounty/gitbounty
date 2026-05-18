'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRepos } from '@/hooks/useRepos'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ReposPage() {
  const { data, isLoading, error } = useRepos()
  const [search, setSearch] = useState('')

  const repos = data?.repos ?? []
  const filtered = search
    ? repos.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.owner.toLowerCase().includes(search.toLowerCase()),
      )
    : repos

  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/repos" />

          <section className="pt-12 pb-8 max-w-3xl">
            <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05]">
              repos with <span className="text-accent">bounties</span>.
            </h1>
            <p className="mt-4 text-sm text-muted max-w-2xl leading-relaxed">
              repos on the gitlawb network that have posted bounties · sorted by activity ·
              {data && ` ${data.count} repos`}
            </p>
          </section>
        </main>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="text-xs text-muted">
          <span className="text-accent">$</span> gl repo list --has-bounties
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="filter by repo name or did..."
          className="w-full bg-transparent border-b border-border focus:border-accent outline-none px-2 py-2 text-sm"
        />

        {isLoading ? (
          <BlinkingCursor label="$ aggregating repos" />
        ) : error ? (
          <EmptyState>error loading repos · {String(error).slice(0, 80)}</EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>no repos found</EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((r) => (
              <a
                key={`${r.owner}-${r.name}`}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-surface/40 hover:bg-surface border border-border hover:border-border-strong rounded-lg p-4 transition group"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted truncate">
                      {r.owner.slice(0, 8)}…
                    </div>
                    <div className="text-base text-primary group-hover:text-accent mt-1 truncate">
                      {r.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-accent font-semibold">{r.bountyCount}</div>
                    <div className="text-[9px] text-muted uppercase tracking-[0.15em]">
                      bounties
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-muted">
                  Σ {r.totalReward.toLocaleString()} $GITLAWB total · {r.latestBountyAge || '—'}
                </div>
              </a>
            ))}
          </div>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
