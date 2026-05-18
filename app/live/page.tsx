'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useBounties } from '@/hooks/useBounties'
import { useOffChainBounties } from '@/hooks/useOffChainBounties'
import { useEvents } from '@/hooks/useEvents'
import { useDidRegistrations } from '@/hooks/useDidRegistrations'
import { useNetworkEvents } from '@/hooks/useNetworkEvents'
import { useNetworkAgents } from '@/hooks/useNetworkAgents'
import { useNetworkRepos } from '@/hooks/useNetworkRepos'
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
  | 'DIDRegistered'
  | 'RepoSeen'
  | 'CommitPushed'

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
  isNew?: boolean // flipped true for items that appeared in the most recent poll
}

const KIND_LABEL: Record<FeedKind, string> = {
  BountyCreated: 'bounty posted',
  BountyClaimed: 'bounty claimed',
  BountySubmitted: 'pr submitted',
  BountyCompleted: 'bounty completed',
  BountyCancelled: 'bounty cancelled',
  BountyDisputed: 'bounty disputed',
  OffChainBounty: 'gitlawb bounty',
  DIDRegistered: 'agent registered',
  RepoSeen: 'repo active',
  CommitPushed: 'commit pushed',
}

const KIND_COLOR: Record<FeedKind, string> = {
  BountyCreated: 'text-status-open',
  BountyClaimed: 'text-status-claimed',
  BountySubmitted: 'text-status-claimed',
  BountyCompleted: 'text-status-completed',
  BountyCancelled: 'text-status-cancelled',
  BountyDisputed: 'text-status-disputed',
  OffChainBounty: 'text-muted',
  DIDRegistered: 'text-status-completed',
  RepoSeen: 'text-muted',
  CommitPushed: 'text-accent',
}

const KIND_GLYPH: Record<FeedKind, string> = {
  BountyCreated: '+',
  BountyClaimed: '◐',
  BountySubmitted: '↑',
  BountyCompleted: '✓',
  BountyCancelled: '✗',
  BountyDisputed: '!',
  OffChainBounty: '◇',
  DIDRegistered: '◉',
  RepoSeen: '▢',
  CommitPushed: '→',
}

export default function LivePage() {
  const { data: onChain = [] } = useBounties()
  const { data: offSnap } = useOffChainBounties()
  const { data: rawEvents } = useEvents(50)
  const { data: didSnap } = useDidRegistrations()
  const { data: netSnap } = useNetworkEvents()
  const { data: agentsSnap } = useNetworkAgents(100)
  const { data: reposSnap } = useNetworkRepos(100, 'updated')
  const [filterKind, setFilterKind] = useState<FeedKind | 'all'>('all')
  const [searchDid, setSearchDid] = useState('')

  // Track which item ids we've already shown — anything not in this set is "NEW"
  const seenIds = useRef<Set<string>>(new Set())
  // Bump a counter every time NEW items land — drives the live indicator flash
  const [flashTick, setFlashTick] = useState(0)

  const items = useMemo<FeedItem[]>(() => {
    const out: FeedItem[] = []
    const now = Date.now()

    // Parse "14d ago" / "3h ago" / "30m ago" / "<1m ago" → real timestampMs
    const parseAge = (label: string): number => {
      if (/^<1m/i.test(label)) return now - 30 * 1000
      const m = label.match(/(\d+)\s*([smhd])/i)
      if (!m) return now
      const n = Number.parseInt(m[1], 10)
      const unit = m[2].toLowerCase()
      const sec = unit === 'd' ? 86400 : unit === 'h' ? 3600 : unit === 'm' ? 60 : 1
      return now - n * sec * 1000
    }

    // On-chain bounty events — treat block number proximity to "head" as recency
    // (recent block = closer to now). We don't have block timestamps without extra RPC,
    // so approximate with: now - (current_block - event_block) * 2s
    const latestBlockEstimate = Math.max(
      ...(rawEvents ?? []).map((e) => Number(e.blockNumber)),
      ...(didSnap?.events ?? []).map((e) => Number(e.blockNumber)),
      0,
    )
    const blockToMs = (block: number) => {
      if (latestBlockEstimate === 0) return now
      const blocksAgo = latestBlockEstimate - block
      return now - blocksAgo * 2000 // base ~2s blocks
    }

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
        timestampMs: blockToMs(Number(ev.blockNumber)),
        link: `/bounty/${ev.bountyId}`,
      })
    }

    // Off-chain bounties — parse age label into real timestamp
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
        timestampMs: parseAge(b.ageLabel),
        link: b.url,
      })
    }

    // On-chain DID registrations (real registry events)
    for (const did of didSnap?.events ?? []) {
      out.push({
        id: `did-${did.txHash}`,
        kind: 'DIDRegistered',
        source: 'on-chain',
        title: `new agent: ${did.did.replace(/^did:[^:]+:/, '').slice(0, 12)}…`,
        detail: `registered on GitlawbDIDRegistry · owner ${did.owner.slice(0, 8)}…`,
        did: did.did,
        ageLabel: '',
        timestampMs: blockToMs(Number(did.blockNumber)),
        link: `/agent/${encodeURIComponent(did.did.replace(/^did:[^:]+:/, ''))}`,
      })
    }

    // Synthetic agent appearances: every distinct DID that posted a bounty
    // is effectively an active agent on the network — even if no on-chain
    // DID Registry event was emitted in our window.
    const seenAgents = new Set<string>(
      (didSnap?.events ?? []).map((e) => e.did.replace(/^did:[^:]+:/, '')),
    )
    const agentFirstSeen = new Map<string, string>() // did → earliest ageLabel
    for (const b of offSnap?.bounties ?? []) {
      if (!b.did) continue
      if (seenAgents.has(b.did)) continue
      // Track the OLDEST age for this agent (= when first seen)
      const prev = agentFirstSeen.get(b.did)
      if (!prev || parseAge(b.ageLabel) < parseAge(prev)) {
        agentFirstSeen.set(b.did, b.ageLabel)
      }
    }
    for (const [agentDid, label] of agentFirstSeen) {
      out.push({
        id: `agent-${agentDid}`,
        kind: 'DIDRegistered',
        source: 'off-chain',
        title: `agent active: ${agentDid.slice(0, 12)}…`,
        detail: `first seen on gitlawb network · ${label}`,
        did: agentDid,
        ageLabel: label,
        timestampMs: parseAge(label),
        link: `/agent/${encodeURIComponent(agentDid)}`,
      })
    }

    // Repos derived from off-chain bounties (deduplicated)
    const seenRepos = new Set<string>()
    for (const b of offSnap?.bounties ?? []) {
      if (!b.did || !b.repoName) continue
      const key = `${b.did}/${b.repoName}`
      if (seenRepos.has(key)) continue
      seenRepos.add(key)
      out.push({
        id: `repo-${key}`,
        kind: 'RepoSeen',
        source: 'off-chain',
        title: `repo active: ${b.repoName}`,
        detail: `${b.did.slice(0, 12)}…/${b.repoName} · bounty volume detected`,
        did: b.did,
        ageLabel: b.ageLabel,
        timestampMs: parseAge(b.ageLabel),
        link: `https://gitlawb.com/${b.did}/${b.repoName}`,
      })
    }

    // Real-time commits/ref-updates from gitlawb.com/node/events (the LIVE feed)
    for (const ev of netSnap?.events ?? []) {
      out.push({
        id: `commit-${ev.commitHash}-${ev.did}-${ev.repoName}`,
        kind: 'CommitPushed',
        source: 'off-chain',
        title: `${ev.repoName} · ${ev.commitHash}`,
        detail: `${ev.did.slice(0, 12)}…/${ev.repoName} · ref-update gossipsub`,
        did: ev.did,
        ageLabel: ev.ageLabel,
        timestampMs: parseAge(ev.ageLabel),
        link: `https://gitlawb.com/${ev.did}/${ev.repoName}`,
      })
    }

    // Network-wide AGENT registrations (firehose from node.gitlawb.com/api/v1/agents)
    // Real timestamps from registered_at — properly ordered, no synthetic guessing.
    for (const a of agentsSnap?.agents ?? []) {
      const ts = a.registeredAt ? new Date(a.registeredAt).getTime() : now
      out.push({
        id: `netagent-${a.did}`,
        kind: 'DIDRegistered',
        source: 'off-chain',
        title: `new agent: ${a.did.slice(0, 16)}…`,
        detail: `registered on gitlawb network · trust ${a.trustScore.toFixed(2)} · caps: ${(a.capabilities ?? []).slice(0, 3).join(', ')}`,
        did: a.did,
        ageLabel: a.registeredAgo,
        timestampMs: ts,
        link: `/agent/${encodeURIComponent(a.did)}`,
      })
    }

    // Network-wide REPO updates (firehose from node.gitlawb.com/api/v1/repos)
    for (const r of reposSnap?.repos ?? []) {
      const ts = r.updatedAt ? new Date(r.updatedAt).getTime() : now
      out.push({
        id: `netrepo-${r.owner}-${r.name}`,
        kind: 'RepoSeen',
        source: 'off-chain',
        title: `repo updated: ${r.name}`,
        detail: `${r.owner.slice(0, 12)}…/${r.name}${r.starCount ? ` · ★${r.starCount}` : ''}${r.description ? ` · ${r.description.slice(0, 60)}` : ''}`,
        did: r.owner,
        ageLabel: r.updatedAgo,
        timestampMs: ts,
        link: r.profileUrl,
      })
    }

    return out.sort((a, b) => b.timestampMs - a.timestampMs)
  }, [onChain, offSnap, rawEvents, didSnap, netSnap, agentsSnap, reposSnap])

  // Diff against previous render — flag freshly-appeared items as isNew.
  // First render: everything goes into seenIds without flashing (would be noise).
  const itemsWithNewFlag = useMemo<FeedItem[]>(() => {
    const isFirstRender = seenIds.current.size === 0
    let freshCount = 0
    const out = items.map((item) => {
      if (seenIds.current.has(item.id)) return item
      seenIds.current.add(item.id)
      if (isFirstRender) return item
      freshCount += 1
      return { ...item, isNew: true }
    })
    if (freshCount > 0) {
      // Defer the flash bump to after render to avoid setState-in-render warnings
      queueMicrotask(() => setFlashTick((t) => t + 1))
    }
    return out
  }, [items])

  // Auto-clear isNew flag after 15s so the badge fades
  useEffect(() => {
    if (!itemsWithNewFlag.some((i) => i.isNew)) return
    const t = setTimeout(() => setFlashTick((tick) => tick + 1), 15_000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashTick])

  // Items are stale-marked once they pass through itemsWithNewFlag again on next poll.
  // We override isNew → false here once the badge timer expires.
  const ageOutCutoff = Date.now() - 15_000
  const displayItems = itemsWithNewFlag.map((i) =>
    i.isNew && i.timestampMs < ageOutCutoff ? { ...i, isNew: false } : i,
  )

  const filtered = displayItems.filter((i) => {
    if (filterKind !== 'all' && i.kind !== filterKind) return false
    if (searchDid && !(i.did ?? '').toLowerCase().includes(searchDid.toLowerCase())) return false
    return true
  })

  // "live" indicator pulsing — flashes faster when new items just arrived
  const [pulse, setPulse] = useState(false)
  const newItemCount = filtered.filter((i) => i.isNew).length
  useEffect(() => {
    const interval = newItemCount > 0 ? 400 : 1500 // flash fast on new events
    const t = setInterval(() => setPulse((p) => !p), interval)
    return () => clearInterval(t)
  }, [newItemCount])

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
          {(['all', 'CommitPushed', 'OffChainBounty', 'DIDRegistered', 'RepoSeen', 'BountyCreated', 'BountyClaimed', 'BountyCompleted'] as const).map(
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
          {item.isNew && (
            <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-accent text-base font-semibold tracking-[0.2em] animate-pulse">
              NEW
            </span>
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

  const className = `flex items-start gap-3 ${
    item.isNew ? 'bg-accent/5 border-accent/60' : 'bg-surface/40 border-border hover:border-border-strong'
  } hover:bg-surface border rounded-lg p-3 transition`

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
