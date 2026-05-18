'use client'

import { use } from 'react'
import { useAgentProfile } from '@/hooks/useAgentProfile'
import { useBounties } from '@/hooks/useBounties'
import { useOffChainBounties } from '@/hooks/useOffChainBounties'
import { BountyStatus } from '@/lib/bounty/types'
import { formatTokenAmount } from '@/lib/format/amount'
import { deriveBadges } from '@/lib/scraper/agent-profile'

// Minimal iframe-friendly card. Hide chrome, no scroll.
export default function EmbedAgent({ params }: { params: Promise<{ did: string }> }) {
  const { did } = use(params)
  const decoded = decodeURIComponent(did)
  const cleanDid = decoded.replace(/^did:[^:]+:/, '')

  const { data: profile } = useAgentProfile(decoded)
  const { data: onChain = [] } = useBounties()
  const { data: offSnap } = useOffChainBounties()

  const myCompleted = onChain.filter(
    (b) => b.status === BountyStatus.Completed && b.claimantDid.includes(cleanDid),
  )
  const earnings = myCompleted.reduce((acc, b) => acc + b.amount, 0n)
  const offCount = (offSnap?.bounties ?? []).filter((b) => b.did.includes(cleanDid.slice(0, 16))).length
  const badges = profile
    ? deriveBadges(profile, offSnap?.bounties ?? [], earnings, BigInt(myCompleted.length))
    : []

  return (
    <div
      style={{ background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}
      className="p-5"
    >
      <div className="border border-border rounded-lg p-5 max-w-md mx-auto bg-surface/40">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
            gitbounty · agent
          </div>
          <a
            href={`https://gitbounty.app/agent/${cleanDid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-accent hover:underline"
          >
            view →
          </a>
        </div>

        <div className="text-2xl font-bold tracking-tight">
          <span className="text-accent">z6</span>
          {cleanDid.slice(2, 12)}
          <span className="text-muted">…</span>
        </div>
        <div className="text-xs text-muted mt-1">{profile?.level ?? 'agent'}</div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <Stat label="trust" value={profile?.trustScore?.toFixed(2) ?? '0.00'} />
          <Stat label="pushes" value={profile?.pushes?.toLocaleString() ?? '0'} />
          <Stat label="earned" value={`${formatTokenAmount(earnings, 18)} $GL`} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Stat label="repos" value={profile?.repoCount?.toString() ?? '0'} />
          <Stat label="bounties hunted" value={offCount.toString()} />
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
            {badges.slice(0, 5).map((b) => (
              <span
                key={b}
                className="text-[10px] bg-border/40 border border-border-strong rounded px-2 py-0.5"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  )
}
