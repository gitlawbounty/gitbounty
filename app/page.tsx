'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useBounties } from '@/hooks/useBounties'
import { ProtocolStats } from '@/components/ProtocolStats'
import { BountyFilters, type StatusFilter, type Sort } from '@/components/BountyFilters'
import { BountyCard } from '@/components/BountyCard'
import { ActivityFeed } from '@/components/ActivityFeed'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { EmptyState } from '@/components/ui/EmptyState'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'
import { BountyStatus } from '@/lib/bounty/types'

export default function Home() {
  const { data: bounties = [], isLoading } = useBounties()
  const [filters, setFilters] = useState<{ status: StatusFilter; sort: Sort; search: string }>({
    status: 'all',
    sort: 'newest',
    search: '',
  })

  const filtered = useMemo(() => {
    let out = bounties
    if (filters.status !== 'all') out = out.filter((b) => b.status === filters.status)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      out = out.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.repoOwner.toLowerCase().includes(q) ||
          b.repoName.toLowerCase().includes(q) ||
          b.claimantDid.toLowerCase().includes(q),
      )
    }
    if (filters.sort === 'newest') {
      out = [...out].sort((a, b) => Number(b.createdAt - a.createdAt))
    } else if (filters.sort === 'highest') {
      out = [...out].sort((a, b) => (b.amount > a.amount ? 1 : -1))
    } else if (filters.sort === 'closing') {
      out = [...out]
        .filter((b) => b.status === BountyStatus.Claimed)
        .sort((a, b) => Number(a.claimedAt + a.deadline - (b.claimedAt + b.deadline)))
    }
    return out
  }, [bounties, filters])

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      <SiteHeader activePath="/" />

      {/* Command preamble */}
      <div className="text-xs text-muted">
        <span className="text-accent">$</span> gl bounty list --status=open
      </div>

      <ProtocolStats />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          <BountyFilters {...filters} onChange={setFilters} />
          {isLoading ? (
            <BlinkingCursor label="$ fetching bounties" />
          ) : filtered.length === 0 ? (
            bounties.length === 0 ? (
              <EmptyState
                action={
                  <Link href="/post" className="text-accent hover:underline">
                    [ post the first bounty ]
                  </Link>
                }
              >
                no bounties yet. the contract is alpha — be the first.
              </EmptyState>
            ) : (
              <EmptyState
                action={
                  <button
                    onClick={() => setFilters({ status: 'all', sort: 'newest', search: '' })}
                    className="text-accent hover:underline"
                  >
                    [ clear all ]
                  </button>
                }
              >
                0 results. try a different filter.
              </EmptyState>
            )
          ) : (
            <div className="space-y-3">
              {filtered.map((b) => (
                <BountyCard key={b.id} bounty={b} />
              ))}
            </div>
          )}
        </div>

        <aside>
          <ActivityFeed />
        </aside>
      </div>

      <SiteFooter />
    </main>
  )
}
