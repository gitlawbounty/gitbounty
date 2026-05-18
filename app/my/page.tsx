'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useBounties } from '@/hooks/useBounties'
import { BountyCard } from '@/components/BountyCard'
import { WalletButton } from '@/components/WalletButton'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { EmptyState } from '@/components/ui/EmptyState'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'

type Tab = 'posted' | 'claimed'

export default function MyPage() {
  const { address, isConnected } = useAccount()
  const { data: bounties = [], isLoading } = useBounties()
  const [tab, setTab] = useState<Tab>('posted')

  const filtered = bounties.filter((b) =>
    tab === 'posted'
      ? b.creator.toLowerCase() === address?.toLowerCase()
      : b.claimantAddress?.toLowerCase() === address?.toLowerCase(),
  )

  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/my" />

          <section className="pt-12 pb-8 max-w-3xl">
            <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05]">
              my <span className="text-accent">bounties</span>.
            </h1>
            <p className="mt-4 text-sm text-muted max-w-2xl leading-relaxed">
              on-chain bounties you've posted or claimed via your connected wallet.
            </p>
          </section>
        </main>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="text-xs text-muted">
          <span className="text-accent">$</span> gl bounty list --by=me
        </div>

        {!isConnected ? (
          <div className="bg-surface/40 border border-border rounded-lg p-6 space-y-3">
            <div className="text-base">wallet not connected.</div>
            <div className="text-sm text-muted">connect your wallet to see your bounty activity.</div>
            <div className="pt-2">
              <WalletButton />
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-1 border-b border-border">
              {(['posted', 'claimed'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${
                    tab === t
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted hover:text-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {isLoading ? (
              <BlinkingCursor label="$ loading your bounties" />
            ) : filtered.length === 0 ? (
              <EmptyState
                action={
                  tab === 'posted' ? (
                    <Link href="/post" className="text-accent hover:underline text-sm">
                      post your first bounty →
                    </Link>
                  ) : (
                    <Link href="/" className="text-accent hover:underline text-sm">
                      browse open bounties →
                    </Link>
                  )
                }
              >
                {tab === 'posted'
                  ? "you haven't posted any on-chain bounty."
                  : "you haven't claimed any on-chain bounty."}
              </EmptyState>
            ) : (
              <div className="space-y-3">
                {filtered.map((b) => (
                  <BountyCard key={b.id} bounty={b} />
                ))}
              </div>
            )}
          </>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
