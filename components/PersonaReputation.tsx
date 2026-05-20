'use client'

import { useEffect, useState } from 'react'

interface Weekly { week: string; displayScore: number; votes: number }
interface Reputation {
  persona: string
  totalPicks: number
  completionRate: number
  displayScore: number
  weekly: Weekly[]
}

export function PersonaReputation({ persona }: { persona: string }) {
  const [rep, setRep] = useState<Reputation | null>(null)
  const [votes, setVotes] = useState<number | null>(null)
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/persona/${persona}/reputation`)
      .then((r) => r.json())
      .then((d: Reputation) => setRep(d))
      .catch(() => setRep(null))
      .finally(() => setLoading(false))
    fetch(`/api/persona/${persona}/vote`)
      .then((r) => r.json())
      .then((d: { votes: number }) => setVotes(d.votes))
      .catch(() => setVotes(0))
  }, [persona])

  async function vote() {
    const res = await fetch(`/api/persona/${persona}/vote`, { method: 'POST' })
    const d = (await res.json()) as { votes: number; counted: boolean }
    setVotes(d.votes)
    setVoted(true)
  }

  if (loading) return <div className="text-xs text-muted font-mono">loading reputation…</div>

  const hasData = rep && rep.totalPicks > 0
  return (
    <div className="border border-border rounded-lg p-5 space-y-4 bg-surface/40">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">reputation · outcome score</span>
        <span className="text-3xl font-bold text-accent">{hasData ? rep.displayScore : '—'}</span>
      </div>

      {hasData ? (
        <div className="flex gap-6 text-xs text-muted font-mono">
          <span>{rep.totalPicks} picks</span>
          <span>{Math.round(rep.completionRate * 100)}% completed</span>
        </div>
      ) : (
        <div className="text-xs text-muted font-mono">
          no scored picks yet — score appears after the first weekly snapshot resolves.
        </div>
      )}

      {hasData && (
        <div className="flex items-end gap-1 h-12">
          {rep.weekly.slice(-12).map((w) => (
            <div
              key={w.week}
              title={`${w.week} · ${w.displayScore}`}
              className="flex-1 bg-accent/30 rounded-sm"
              style={{ height: `${Math.max(4, w.displayScore)}%` }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted font-mono">
          community: <span className="text-primary">{votes ?? 0}</span> say it&apos;s calling it right
        </span>
        <button
          onClick={vote}
          disabled={voted}
          className="text-xs font-mono px-3 py-1.5 rounded border border-border hover:border-accent hover:text-accent disabled:opacity-40 transition"
        >
          {voted ? 'voted ✓' : '▲ called it right'}
        </button>
      </div>
    </div>
  )
}
