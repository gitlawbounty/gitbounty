'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useNetworkAgents } from '@/hooks/useNetworkAgents'
import { useNetworkStats } from '@/hooks/useNetworkStats'
import { formatTokenAmount } from '@/lib/format/amount'
import { BlinkingCursor } from './ui/BlinkingCursor'

export function AgentLeaderboard() {
  const { agents: onChainAgents, isLoading: onChainLoading } = useAgents()
  const { data: net } = useNetworkAgents(100)
  const { data: stats } = useNetworkStats()

  // Track ids seen on previous poll → flag NEW agents
  const seen = useRef<Set<string>>(new Set())
  const [, forceRender] = useState(0)
  const fresh = new Set<string>()
  const isFirst = seen.current.size === 0
  for (const a of net?.agents ?? []) {
    if (!seen.current.has(a.did)) {
      seen.current.add(a.did)
      if (!isFirst) fresh.add(a.did)
    }
  }
  useEffect(() => {
    if (fresh.size > 0) {
      const t = setTimeout(() => forceRender((n) => n + 1), 15_000)
      return () => clearTimeout(t)
    }
  }, [fresh.size])

  return (
    <div className="space-y-10">
      {/* ── ON-CHAIN LEADERBOARD ── */}
      <section className="space-y-4">
        <header className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">on-chain leaderboard</h2>
            <p className="text-xs text-muted font-mono mt-0.5">
              ranked by completed bounties via GitlawbBounty.sol
            </p>
          </div>
          <span className="text-xs font-mono text-muted shrink-0">
            {onChainLoading ? '…' : `${onChainAgents.length} earners`}
          </span>
        </header>

        {onChainLoading ? (
          <BlinkingCursor label="$ aggregating on-chain" />
        ) : onChainAgents.length === 0 ? (
          <div className="text-xs text-muted py-3 text-center">
            no on-chain completions yet ·{' '}
            <Link href="/" className="text-accent hover:underline">
              browse open bounties
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs uppercase tracking-wider border-b border-border">
                <th className="py-2 text-left">rank</th>
                <th className="py-2 text-left">did</th>
                <th className="py-2 text-right">earnings</th>
                <th className="py-2 text-right">completed</th>
              </tr>
            </thead>
            <tbody>
              {onChainAgents.map((a) => (
                <tr key={a.did} className="border-b border-border hover:bg-border/30">
                  <td className="py-2 text-accent">#{a.rank}</td>
                  <td className="py-2 truncate max-w-xs">{a.did}</td>
                  <td className="py-2 text-right text-accent">
                    {formatTokenAmount(a.earnings, 18)} $GITLAWB
                  </td>
                  <td className="py-2 text-right">{Number(a.completedCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── NETWORK AGENTS (FIREHOSE) ── */}
      <section className="space-y-4">
        <header className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">network agents</h2>
            <p className="text-xs text-muted font-mono mt-0.5">
              from node.gitlawb.com · sorted by most recent registration · refreshes every 10s
            </p>
          </div>
          <span className="text-xs font-mono text-muted shrink-0">
            {stats ? `${stats.totalAgents.toLocaleString()} total · showing ${net?.count ?? 0}` : '…'}
          </span>
        </header>

        {!net ? (
          <BlinkingCursor label="$ pulling network agents" />
        ) : net.agents.length === 0 ? (
          <div className="text-xs text-muted py-3 text-center">
            {net.error ? `upstream error: ${net.error}` : 'no agents found'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs uppercase tracking-wider border-b border-border">
                <th className="py-2 text-left">did</th>
                <th className="py-2 text-left">capabilities</th>
                <th className="py-2 text-right">trust</th>
                <th className="py-2 text-right">registered</th>
              </tr>
            </thead>
            <tbody>
              {net.agents.map((a) => {
                const isNew = fresh.has(a.did)
                return (
                  <tr
                    key={a.did}
                    className={`border-b border-border transition-colors ${
                      isNew ? 'bg-accent/5 border-accent/40' : 'hover:bg-border/30'
                    }`}
                  >
                    <td className="py-2 truncate max-w-xs">
                      <a
                        href={a.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent transition"
                      >
                        {a.did.slice(0, 20)}…
                      </a>
                      {isNew && (
                        <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-accent text-base font-semibold tracking-[0.2em] animate-pulse">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-muted truncate max-w-[160px]">
                      {(a.capabilities ?? []).slice(0, 2).join(', ')}
                    </td>
                    <td className="py-2 text-right tabular-nums">{a.trustScore.toFixed(2)}</td>
                    <td className="py-2 text-right text-xs text-muted">{a.registeredAgo}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
