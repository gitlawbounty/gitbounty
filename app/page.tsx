'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useBounties } from '@/hooks/useBounties'
import { useOffChainBounties } from '@/hooks/useOffChainBounties'
import { ProtocolStats } from '@/components/ProtocolStats'
import { BountyFilters, type StatusFilter, type Sort } from '@/components/BountyFilters'
import { BountyCard } from '@/components/BountyCard'
import { OffChainBountyCard } from '@/components/OffChainBountyCard'
import { ActivityFeed } from '@/components/ActivityFeed'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { EmptyState } from '@/components/ui/EmptyState'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'
import { BountyStatus } from '@/lib/bounty/types'

export default function Home() {
  const { data: bounties = [], isLoading: onChainLoading } = useBounties()
  const { data: offChainSnapshot, isLoading: offChainLoading } = useOffChainBounties()
  const offChainBounties = offChainSnapshot?.bounties ?? []

  const [filters, setFilters] = useState<{ status: StatusFilter; sort: Sort; search: string }>({
    status: 'all',
    sort: 'newest',
    search: '',
  })

  const filteredOnChain = useMemo(() => {
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

  const filteredOffChain = useMemo(() => {
    let out = offChainBounties
    if (filters.search) {
      const q = filters.search.toLowerCase()
      out = out.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.did.toLowerCase().includes(q) ||
          b.repoName.toLowerCase().includes(q),
      )
    }
    if (filters.sort === 'highest') {
      out = [...out].sort((a, b) => b.amountNumeric - a.amountNumeric)
    }
    // No reliable createdAt for offchain — keep upstream order otherwise
    return out
  }, [offChainBounties, filters.search, filters.sort])

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      <SiteHeader activePath="/" />

      <div className="text-xs text-muted">
        <span className="text-accent">$</span> gl bounty list --status=open --include-offchain
      </div>

      <ProtocolStats />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-8">
          <BountyFilters {...filters} onChange={setFilters} />

          {/* OFF-CHAIN section — bounties from gitlawb p2p network */}
          <section className="space-y-3">
            <header className="flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="text-sm uppercase tracking-[0.2em] text-muted">
                <span className="text-accent">◇</span> from gitlawb network
              </h2>
              <span className="text-[11px] text-muted">
                {offChainLoading ? '…' : `${filteredOffChain.length} bounties`}
              </span>
            </header>

            {offChainLoading ? (
              <BlinkingCursor label="$ scraping gitlawb.com" />
            ) : filteredOffChain.length === 0 ? (
              <EmptyState>
                {offChainSnapshot?.error
                  ? `upstream error: ${offChainSnapshot.error}`
                  : '0 bounties · try clearing search'}
              </EmptyState>
            ) : (
              <div className="space-y-3">
                {filteredOffChain.slice(0, 30).map((b) => (
                  <OffChainBountyCard key={b.uuid} bounty={b} />
                ))}
                {filteredOffChain.length > 30 && (
                  <a
                    href="https://gitlawb.com/bounties"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-muted hover:text-accent py-3"
                  >
                    + {filteredOffChain.length - 30} more on gitlawb.com ↗
                  </a>
                )}
              </div>
            )}
          </section>

          {/* ON-CHAIN section — bounties escrowed on GitlawbBounty.sol */}
          <section className="space-y-3">
            <header className="flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="text-sm uppercase tracking-[0.2em] text-muted">
                <span className="text-accent">●</span> on-chain escrow
              </h2>
              <span className="text-[11px] text-muted">
                {onChainLoading ? '…' : `${filteredOnChain.length} bounties`}
              </span>
            </header>

            {onChainLoading ? (
              <BlinkingCursor label="$ fetching on-chain" />
            ) : filteredOnChain.length === 0 ? (
              bounties.length === 0 ? (
                <EmptyState
                  action={
                    <Link href="/post" className="text-accent hover:underline">
                      [ post the first on-chain bounty ]
                    </Link>
                  }
                >
                  no on-chain bounties yet. GitlawbBounty.sol is alpha — be the first to escrow.
                </EmptyState>
              ) : (
                <EmptyState
                  action={
                    <button
                      onClick={() => setFilters({ status: 'all', sort: 'newest', search: '' })}
                      className="text-accent hover:underline"
                    >
                      [ clear filter ]
                    </button>
                  }
                >
                  0 results match filter
                </EmptyState>
              )
            ) : (
              <div className="space-y-3">
                {filteredOnChain.map((b) => (
                  <BountyCard key={b.id} bounty={b} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside>
          <ActivityFeed />
        </aside>
      </div>

      <SiteFooter />
    </main>
  )
}
