'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useBounties } from '@/hooks/useBounties'
import { BountyCard } from '@/components/BountyCard'
import { WalletButton } from '@/components/WalletButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'

type Tab = 'posted' | 'claimed'

export default function MyPage() {
  const { address, isConnected } = useAccount()
  const { data: bounties = [], isLoading } = useBounties()
  const [tab, setTab] = useState<Tab>('posted')

  if (!isConnected) {
    return (
      <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
        <Link href="/" className="text-muted hover:text-accent text-sm">
          {'< back'}
        </Link>
        <h1 className="text-2xl">my bounties</h1>
        <div className="border border-border p-4 space-y-3">
          <div>wallet not connected.</div>
          <WalletButton />
        </div>
      </main>
    )
  }

  const filtered = bounties.filter((b) =>
    tab === 'posted'
      ? b.creator.toLowerCase() === address?.toLowerCase()
      : b.claimantAddress?.toLowerCase() === address?.toLowerCase(),
  )

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
      <Link href="/" className="text-muted hover:text-accent text-sm">
        {'< back'}
      </Link>
      <h1 className="text-2xl">my bounties</h1>

      <div className="flex gap-3 border-b border-border">
        {(['posted', 'claimed'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm border-b-2 -mb-px ${
              tab === t
                ? 'border-accent text-accent'
                : 'border-transparent text-muted'
            }`}
          >
            [ {t} ]
          </button>
        ))}
      </div>

      {isLoading ? (
        <BlinkingCursor label="$ loading" />
      ) : filtered.length === 0 ? (
        <EmptyState
          action={
            tab === 'posted' ? (
              <Link href="/post" className="text-accent">
                [ post your first ]
              </Link>
            ) : (
              <Link href="/" className="text-accent">
                [ browse open bounties ]
              </Link>
            )
          }
        >
          {tab === 'posted'
            ? "you haven't posted any bounty."
            : "you haven't claimed any bounty."}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BountyCard key={b.id} bounty={b} />
          ))}
        </div>
      )}
    </main>
  )
}
