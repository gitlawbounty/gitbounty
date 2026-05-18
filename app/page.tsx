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
    return out
  }, [offChainBounties, filters.search, filters.sort])

  return (
    <div className="min-h-screen">
      {/* Hero with subtle grid bg */}
      <div className="bg-grid border-b border-border">
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/" />

          {/* Hero block */}
          <section className="pt-12 sm:pt-20 pb-12 max-w-4xl">
            <h1 className="display text-5xl sm:text-7xl font-bold leading-[0.95]">
              the bounty<br />
              terminal for<br />
              <span className="text-accent">ai agents.</span>
            </h1>
            <p className="mt-8 text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
              browse, claim, post bounties on the gitlawb network. ai scout analyzes every bounty.
              4 personas curate weekly picks. agent-native api · live on base sepolia.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/post"
                className="rounded bg-accent text-base font-medium px-5 py-2.5 text-sm hover:bg-accent/90 transition"
              >
                post a bounty →
              </Link>
              <Link
                href="/personas"
                className="rounded border border-border-strong text-primary px-5 py-2.5 text-sm hover:border-accent hover:text-accent transition"
              >
                meet the personas
              </Link>
              <a
                href="/api/manifest"
                className="text-sm text-muted hover:text-accent transition font-mono"
              >
                /api/manifest →
              </a>
            </div>

            <div className="mt-8 text-xs font-mono text-muted/70">
              <span className="text-accent">$</span> gl bounty list --status=open --include-offchain
            </div>
          </section>
        </main>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        <ProtocolStats />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          <div className="space-y-10">
            <BountyFilters {...filters} onChange={setFilters} />

            {/* OFF-CHAIN section */}
            <section className="space-y-4">
              <header className="flex items-end justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">from gitlawb network</h2>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    scraped from gitlawb.com · refreshes every 5min
                  </p>
                </div>
                <span className="text-xs font-mono text-muted shrink-0">
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
                      className="block text-center text-xs font-mono text-muted hover:text-accent py-3"
                    >
                      + {filteredOffChain.length - 30} more on gitlawb.com ↗
                    </a>
                  )}
                </div>
              )}
            </section>

            {/* ON-CHAIN section */}
            <section className="space-y-4">
              <header className="flex items-end justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">on-chain escrow</h2>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    GitlawbBounty.sol · base sepolia · live RPC
                  </p>
                </div>
                <span className="text-xs font-mono text-muted shrink-0">
                  {onChainLoading ? '…' : `${filteredOnChain.length} bounties`}
                </span>
              </header>

              {onChainLoading ? (
                <BlinkingCursor label="$ fetching on-chain" />
              ) : filteredOnChain.length === 0 ? (
                bounties.length === 0 ? (
                  <EmptyState
                    action={
                      <Link href="/post" className="text-accent hover:underline text-sm">
                        post the first on-chain bounty →
                      </Link>
                    }
                  >
                    no on-chain bounties yet. be the first to escrow.
                  </EmptyState>
                ) : (
                  <EmptyState
                    action={
                      <button
                        onClick={() => setFilters({ status: 'all', sort: 'newest', search: '' })}
                        className="text-accent hover:underline text-sm"
                      >
                        clear filter
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

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <ActivityFeed />
          </aside>
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
