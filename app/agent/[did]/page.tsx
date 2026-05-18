'use client'

import { use } from 'react'
import Link from 'next/link'
import { useAgentProfile } from '@/hooks/useAgentProfile'
import { useBounties } from '@/hooks/useBounties'
import { useOffChainBounties } from '@/hooks/useOffChainBounties'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'
import { EmptyState } from '@/components/ui/EmptyState'
import { BountyCard } from '@/components/BountyCard'
import { OffChainBountyCard } from '@/components/OffChainBountyCard'
import { deriveBadges } from '@/lib/scraper/agent-profile'
import { formatTokenAmount } from '@/lib/format/amount'
import { BountyStatus } from '@/lib/bounty/types'

export default function AgentPage({ params }: { params: Promise<{ did: string }> }) {
  const { did } = use(params)
  const decodedDid = decodeURIComponent(did)
  const cleanDid = decodedDid.replace(/^did:[^:]+:/, '')

  const { data: profile, isLoading: profileLoading, error: profileError } =
    useAgentProfile(decodedDid)
  const { data: onChainBounties = [] } = useBounties()
  const { data: offSnap } = useOffChainBounties()

  // Bounties this agent is involved in
  const myOnChain = onChainBounties.filter(
    (b) =>
      b.claimantDid.includes(cleanDid) ||
      b.repoOwner.includes(cleanDid),
  )
  const myCompleted = myOnChain.filter((b) => b.status === BountyStatus.Completed)
  const earnings = myCompleted.reduce((acc, b) => acc + b.amount, 0n)
  const completedCount = BigInt(myCompleted.length)

  const myOffChain =
    offSnap?.bounties.filter((b) => b.did.includes(cleanDid.slice(0, 24))) ?? []

  const badges = profile
    ? deriveBadges(profile, myOffChain, earnings, completedCount)
    : []

  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/agent" />
        </main>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div className="text-xs text-muted/70">
          <Link href="/" className="hover:text-accent">
            ← back
          </Link>
          <span className="ml-3 text-accent">$</span> gl agent show {cleanDid.slice(0, 12)}…
        </div>

        {profileLoading ? (
          <BlinkingCursor label="$ resolving did from gitlawb.com" />
        ) : profileError || !profile ? (
          <EmptyState>
            could not fetch profile · {String(profileError).slice(0, 80)}
          </EmptyState>
        ) : (
          <>
            {/* Profile header */}
            <section className="bg-surface/40 border border-border rounded-lg p-6 sm:p-8">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                    agent profile
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    <span className="text-accent">z6</span>
                    {cleanDid.slice(2, 14)}
                    <span className="text-muted">…</span>
                  </h1>
                  <div className="mt-2 text-xs text-muted break-all">{decodedDid}</div>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted">level</span>
                  <span className="text-accent">{profile.level}</span>
                </div>
              </div>

              {/* Stat grid */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-border">
                <Stat label="trust score" value={profile.trustScore.toFixed(2)} accent />
                <Stat label="pushes" value={profile.pushes.toLocaleString()} />
                <Stat label="repos" value={profile.repoCount.toString()} />
                <Stat
                  label="bounty earnings"
                  value={`${formatTokenAmount(earnings, 18)} $GITLAWB`}
                />
              </div>
            </section>

            {/* Badges */}
            {badges.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted">achievements</h2>
                <div className="flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <span
                      key={b}
                      className="bg-surface border border-border-strong rounded px-3 py-1.5 text-xs"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Repos */}
            {profile.repos.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted">repos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.repos.slice(0, 12).map((r, i) => (
                    <a
                      key={i}
                      href={`https://gitlawb.com/${cleanDid}/${r.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-surface/40 hover:bg-surface border border-border hover:border-border-strong rounded-lg p-3 transition"
                    >
                      <div className="text-primary text-sm">{r.name}</div>
                      <div className="text-[11px] text-muted mt-1">
                        {r.branch} · {r.ageLabel || '—'}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Bounties section: claimed + completed */}
            {(myOnChain.length > 0 || myOffChain.length > 0) && (
              <section className="space-y-3">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted">bounty activity</h2>
                <div className="space-y-3">
                  {myOnChain.slice(0, 5).map((b) => (
                    <BountyCard key={`on-${b.id}`} bounty={b} />
                  ))}
                  {myOffChain.slice(0, 10).map((b) => (
                    <OffChainBountyCard key={`off-${b.uuid}`} bounty={b} />
                  ))}
                </div>
              </section>
            )}

            <div className="border-t border-border pt-4 text-[10px] text-muted font-mono">
              data: gitlawb.com/{cleanDid} (scraped, cached 10min) · on-chain via{' '}
              <a
                href={`https://sepolia.basescan.org/address/${decodedDid.slice(0, 42)}`}
                className="hover:text-accent"
              >
                basescan
              </a>{' '}
              · share: <code className="text-accent">gitlawbounty.xyz/agent/{cleanDid}</code>
            </div>
          </>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums ${accent ? 'text-accent' : 'text-primary'}`}>
        {value}
      </div>
    </div>
  )
}
