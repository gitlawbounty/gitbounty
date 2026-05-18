'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useBounties } from '@/hooks/useBounties'
import { useOffChainBounties } from '@/hooks/useOffChainBounties'
import { useEvents } from '@/hooks/useEvents'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'
import { BountyStatus } from '@/lib/bounty/types'

type FeedKind =
  | 'BountyCreated'
  | 'BountyClaimed'
  | 'BountySubmitted'
  | 'BountyCompleted'
  | 'BountyCancelled'
  | 'BountyDisputed'
  | 'OffChainBounty'

interface FeedItem {
  id: string
  kind: FeedKind
  source: 'on-chain' | 'off-chain'
  title: string
  detail: string
  amount?: string
  did?: string
  ageLabel: string
  timestampMs: number
  link?: string
}

const KIND_LABEL: Record<FeedKind, string> = {
  BountyCreated: 'posted',
  BountyClaimed: 'claimed',
  BountySubmitted: 'submitted',
  BountyCompleted: 'completed',
  BountyCancelled: 'cancelled',
  BountyDisputed: 'disputed',
  OffChainBounty: 'gitlawb network',
}

const KIND_COLOR: Record<FeedKind, string> = {
  BountyCreated: 'text-status-open',
  BountyClaimed: 'text-status-claimed',
  BountySubmitted: 'text-status-claimed',
  BountyCompleted: 'text-status-completed',
  BountyCancelled: 'text-status-cancelled',
  BountyDisputed: 'text-status-disputed',
  OffChainBounty: 'text-muted',
}

const KIND_GLYPH: Record<FeedKind, string> = {
  BountyCreated: '+',
  BountyClaimed: '◐',
  BountySubmitted: '↑',
  BountyCompleted: '✓',
  BountyCancelled: '✗',
  BountyDisputed: '!',
  OffChainBounty: '◇',
}

export default function LivePage() {
  const { data: onChain = [] } = useBounties()
  const { data: offSnap } = useOffChainBounties()
  const { data: rawEvents } = useEvents(50)
  const [filterKind, setFilterKind] = useState<FeedKind | 'all'>('all')
  const [searchDid, setSearchDid] = useState('')

  const items = useMemo<FeedItem[]>(() => {
    const out: FeedItem[] = []

    // On-chain bounty events
    for (const ev of rawEvents ?? []) {
      const b = onChain.find((x) => x.id === ev.bountyId)
      out.push({
        id: `${ev.txHash}-${ev.kind}-${ev.bountyId}`,
        kind: ev.kind as FeedKind,
        source: 'on-chain',
        title: b ? b.title : `bounty #${ev.bountyId}`,
        detail: b
          ? `${b.repoOwner.slice(0, 12)}…/${b.repoName} · #${b.issueId}`
          : 'on-chain event',
        did: b?.claimantDid || b?.creator,
        ageLabel: '',
        timestampMs: Number(ev.blockNumber) * 1000, // proxy
        link: `/bounty/${ev.bountyId}`,
      })
    }

    // Off-chain bounties as "appeared on gitlawb" events
    for (const b of offSnap?.bounties ?? []) {
      out.push({
        id: `off-${b.uuid}`,
        kind: 'OffChainBounty',
        source: 'off-chain',
        title: b.title,
        detail: `${b.did.slice(0, 12)}…/${b.repoName} · ${b.status}`,
        amount: b.amount,
        did: b.did,
        ageLabel: b.ageLabel,
        timestampMs: 0,
        link: b.url,
      })
    }

    return out.sort((a, b) => b.timestampMs - a.timestampMs)
  }, [onChain, offSnap, rawEvents])

  const filtered = items.filter((i) => {
    if (filterKind !== 'all' && i.kind !== filterKind) return false
    if (searchDid && !(i.did ?? '').toLowerCase().includes(searchDid.toLowerCase())) return false
    return true
  })

  // Simulated "live" indicator pulsing
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 1500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/live" />

          <section className="pt-12 pb-8">
            <div className="flex items-baseline justify-between flex-wrap gap-4">
              <div>
                <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05]">
                  live <span className="text-accent">activity</span>.
                </h1>
                <p className="mt-3 text-sm text-muted max-w-xl">
                  every bounty event on gitlawb · streamed real-time · scroll the network
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${pulse ? 'bg-accent' : 'bg-accent/40'} transition`}
                />
                <span className="text-accent uppercase tracking-[0.2em]">streaming</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted mr-1">event:</span>
          {(['all', 'BountyCreated', 'BountyClaimed', 'BountyCompleted', 'OffChainBounty'] as const).map(
            (k) => (
              <button
                key={k}
                onClick={() => setFilterKind(k)}
                className={`px-3 py-1 rounded border transition ${
                  filterKind === k
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-border text-muted hover:text-primary'
                }`}
              >
                {k === 'all' ? 'all' : KIND_LABEL[k as FeedKind]}
              </button>
            ),
          )}
          <span className="text-muted mx-2">·</span>
          <input
            value={searchDid}
            onChange={(e) => setSearchDid(e.target.value)}
            placeholder="filter by did…"
            className="bg-transparent border-b border-border focus:border-accent outline-none px-2 py-1 text-xs flex-1 min-w-[200px]"
          />
        </div>

        {/* Stream */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <BlinkingCursor label="$ waiting for events" />
          ) : (
            filtered.slice(0, 100).map((item) => (
              <FeedRow key={item.id} item={item} />
            ))
          )}
        </div>

        <div className="border-t border-border pt-4 text-[10px] text-muted font-mono">
          <span className="text-accent">$</span> showing latest {Math.min(filtered.length, 100)} events ·
          on-chain via websocket · off-chain refreshed every 5min from gitlawb.com
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}

function FeedRow({ item }: { item: FeedItem }) {
  const inner = (
    <>
      <span className={`text-base shrink-0 ${KIND_COLOR[item.kind]} mt-0.5`}>
        {KIND_GLYPH[item.kind]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 text-[10px] uppercase tracking-[0.15em] text-muted">
          <span className={KIND_COLOR[item.kind]}>{KIND_LABEL[item.kind]}</span>
          <span>·</span>
          <span>{item.source}</span>
          {item.ageLabel && (
            <>
              <span>·</span>
              <span>{item.ageLabel}</span>
            </>
          )}
        </div>
        <div className="text-sm text-primary truncate mt-0.5">{item.title}</div>
        <div className="text-[11px] text-muted truncate">{item.detail}</div>
      </div>
      {item.amount && (
        <div className="text-xs text-accent shrink-0 self-center">{item.amount}</div>
      )}
    </>
  )

  const className =
    'flex items-start gap-3 bg-surface/40 hover:bg-surface border border-border hover:border-border-strong rounded-lg p-3 transition'

  if (!item.link) {
    return <div className={className}>{inner}</div>
  }
  if (item.link.startsWith('http')) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={item.link} className={className}>
      {inner}
    </Link>
  )
}
