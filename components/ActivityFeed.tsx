'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvents } from '@/hooks/useEvents'
import { useNetworkAgents } from '@/hooks/useNetworkAgents'
import { useNetworkRepos } from '@/hooks/useNetworkRepos'
import { useOffChainBounties } from '@/hooks/useOffChainBounties'
import { useNetworkEvents } from '@/hooks/useNetworkEvents'
import { BlinkingCursor } from './ui/BlinkingCursor'

type FeedKind =
  | 'agent-registered'
  | 'repo-updated'
  | 'bounty-posted'
  | 'bounty-claimed'
  | 'bounty-completed'
  | 'commit-pushed'
  | 'onchain-event'

interface FeedItem {
  id: string
  kind: FeedKind
  label: string       // first column tag, e.g., "agent" or "repo"
  detail: string      // truncated descriptive line
  ageLabel: string
  timestampMs: number
  href?: string       // optional click target
  external?: boolean  // open in new tab
}

const KIND_GLYPH: Record<FeedKind, string> = {
  'agent-registered': '◆',
  'repo-updated': '◇',
  'bounty-posted': '+',
  'bounty-claimed': '◐',
  'bounty-completed': '✓',
  'commit-pushed': '→',
  'onchain-event': '⬢',
}

const KIND_COLOR: Record<FeedKind, string> = {
  'agent-registered': 'text-status-completed',
  'repo-updated': 'text-muted',
  'bounty-posted': 'text-status-open',
  'bounty-claimed': 'text-status-claimed',
  'bounty-completed': 'text-status-completed',
  'commit-pushed': 'text-accent',
  'onchain-event': 'text-accent',
}

const KIND_TAG: Record<FeedKind, string> = {
  'agent-registered': 'agent',
  'repo-updated': 'repo',
  'bounty-posted': 'bounty',
  'bounty-claimed': 'bounty',
  'bounty-completed': 'bounty',
  'commit-pushed': 'commit',
  'onchain-event': 'on-chain',
}

function ageOf(iso: string | null | undefined): { label: string; ms: number } {
  if (!iso) return { label: '', ms: 0 }
  const ms = new Date(iso).getTime()
  if (Number.isNaN(ms)) return { label: '', ms: 0 }
  const sec = Math.max(0, Math.floor((Date.now() - ms) / 1000))
  if (sec < 60) return { label: `${sec}s ago`, ms }
  if (sec < 3600) return { label: `${Math.floor(sec / 60)}m ago`, ms }
  if (sec < 86400) return { label: `${Math.floor(sec / 3600)}h ago`, ms }
  return { label: `${Math.floor(sec / 86400)}d ago`, ms }
}

export function ActivityFeed() {
  const { data: onChainEvents } = useEvents(10)
  const { data: agentsSnap } = useNetworkAgents(50)
  const { data: reposSnap } = useNetworkRepos(50, 'updated')
  const { data: offSnap } = useOffChainBounties()
  const { data: netEvSnap } = useNetworkEvents()

  const items = useMemo<FeedItem[]>(() => {
    const out: FeedItem[] = []

    // Agent registrations
    for (const a of agentsSnap?.agents ?? []) {
      const { label, ms } = ageOf(a.registeredAt)
      out.push({
        id: `agent-${a.did}`,
        kind: 'agent-registered',
        label: 'agent',
        detail: `${a.did.slice(0, 14)}… joined`,
        ageLabel: label,
        timestampMs: ms,
        href: `/agent/${encodeURIComponent(a.did)}`,
      })
    }

    // Repo updates
    for (const r of reposSnap?.repos ?? []) {
      const { label, ms } = ageOf(r.updatedAt)
      out.push({
        id: `repo-${r.owner}-${r.name}`,
        kind: 'repo-updated',
        label: 'repo',
        detail: `${r.name} · ${r.owner.slice(0, 10)}…`,
        ageLabel: label,
        timestampMs: ms,
        href: r.profileUrl,
        external: true,
      })
    }

    // Bounty events (mapped from status + claim/complete timestamps)
    for (const b of offSnap?.bounties ?? []) {
      const url = `https://gitlawb.com/bounties/${b.uuid}`
      // Posting event
      out.push({
        id: `bounty-post-${b.uuid}`,
        kind: 'bounty-posted',
        label: 'bounty',
        detail: `${b.title.slice(0, 40)}${b.title.length > 40 ? '…' : ''} · ${b.amount}`,
        ageLabel: b.ageLabel,
        // We don't have createdAt as ISO on the OffChainBounty shape; approximate
        // via fetchedAt minus a few minutes per parsed ageLabel.
        timestampMs: parseAgeLabel(b.ageLabel),
        href: url,
        external: true,
      })
    }

    // Real-time commit feed (from gossipsub)
    for (const ev of netEvSnap?.events ?? []) {
      out.push({
        id: `commit-${ev.commitHash}`,
        kind: 'commit-pushed',
        label: 'commit',
        detail: `${ev.repoName} · ${ev.commitHash}`,
        ageLabel: ev.ageLabel,
        timestampMs: parseAgeLabel(ev.ageLabel),
        href: `https://gitlawb.com/${ev.did}/${ev.repoName}`,
        external: true,
      })
    }

    // On-chain bounty events
    for (const ev of onChainEvents ?? []) {
      const kind: FeedKind =
        ev.kind === 'BountyCompleted' ? 'bounty-completed' :
        ev.kind === 'BountyClaimed' ? 'bounty-claimed' :
        ev.kind === 'BountyCreated' ? 'bounty-posted' :
        'onchain-event'
      out.push({
        id: `oc-${ev.txHash}-${ev.kind}-${ev.bountyId}`,
        kind,
        label: 'on-chain',
        detail: `#${ev.bountyId} ${ev.kind.replace('Bounty', '').toLowerCase()}`,
        ageLabel: '',
        timestampMs: Number(ev.blockNumber), // proxy — sort by block desc
        href: `/bounty/${ev.bountyId}`,
      })
    }

    // Sort newest first; drop zero-timestamp items to the bottom
    return out
      .sort((a, b) => b.timestampMs - a.timestampMs)
      .slice(0, 15)
  }, [agentsSnap, reposSnap, offSnap, netEvSnap, onChainEvents])

  // NEW badge tracking — items that weren't in the last render get isNew=true for 12s
  const seen = useRef<Set<string>>(new Set())
  const [, forceTick] = useState(0)
  const fresh = new Set<string>()
  const isFirst = seen.current.size === 0
  for (const i of items) {
    if (!seen.current.has(i.id)) {
      seen.current.add(i.id)
      if (!isFirst) fresh.add(i.id)
    }
  }
  useEffect(() => {
    if (fresh.size === 0) return
    const t = setTimeout(() => forceTick((n) => n + 1), 12_000)
    return () => clearTimeout(t)
  }, [fresh.size])

  return (
    <div className="border border-border rounded-lg bg-surface/30 overflow-hidden font-mono">
      {/* Header — sticky, compact */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-base/40">
        <div className="flex items-baseline gap-2 text-[10px] uppercase tracking-[0.18em] text-muted">
          <span>activity feed</span>
          {items.length > 0 && <span className="text-accent">{items.length}</span>}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-accent uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          live
        </div>
      </div>

      {/* Scrollable stream — fixed height so the box stays small */}
      <div
        className="overflow-y-auto activity-scroll"
        style={{ maxHeight: 360 }}
      >
        {items.length === 0 ? (
          <div className="px-3 py-6">
            <BlinkingCursor label="$ tuning in to gitlawb" />
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((item) => {
              const isNew = fresh.has(item.id)
              const inner = (
                <div
                  className={`flex items-baseline gap-2 py-1.5 px-3 transition leading-tight ${
                    isNew
                      ? 'bg-accent/8 border-l-2 border-accent pl-[10px]'
                      : 'hover:bg-border/20 border-l-2 border-transparent'
                  }`}
                >
                  <span
                    className={`shrink-0 text-[11px] ${KIND_COLOR[item.kind]}`}
                    style={{ lineHeight: '14px' }}
                  >
                    {KIND_GLYPH[item.kind]}
                  </span>
                  <span
                    className={`shrink-0 text-[9px] uppercase tracking-[0.18em] ${KIND_COLOR[item.kind]}`}
                    style={{ minWidth: 38 }}
                  >
                    {KIND_TAG[item.kind]}
                  </span>
                  <span className="shrink-0 text-[9px] text-muted/70 uppercase tracking-[0.12em]">
                    {item.ageLabel || '—'}
                  </span>
                  <span className="flex-1 min-w-0 text-[11px] text-primary truncate">
                    {item.detail}
                  </span>
                  {isNew && (
                    <span className="shrink-0 text-[8px] tracking-[0.2em] text-accent uppercase animate-pulse">
                      new
                    </span>
                  )}
                </div>
              )
              if (!item.href) return <div key={item.id}>{inner}</div>
              if (item.external) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {inner}
                  </a>
                )
              }
              return (
                <Link key={item.id} href={item.href} className="block">
                  {inner}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer — full stream link */}
      <Link
        href="/live"
        className="block text-center py-2 border-t border-border text-[9px] uppercase tracking-[0.22em] text-muted hover:text-accent hover:bg-border/20 transition"
      >
        full stream →
      </Link>
    </div>
  )
}

/** Parse "5m ago", "2h ago", "<1m ago" into approximate ms-since-epoch */
function parseAgeLabel(label: string): number {
  const now = Date.now()
  if (!label) return 0
  if (/^<1m/i.test(label)) return now - 30_000
  const m = label.match(/(\d+)\s*([smhd])/i)
  if (!m) return now
  const n = Number(m[1])
  const unit = m[2].toLowerCase()
  const sec = unit === 'd' ? 86400 : unit === 'h' ? 3600 : unit === 'm' ? 60 : 1
  return now - n * sec * 1000
}
