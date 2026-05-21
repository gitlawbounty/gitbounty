'use client'

import { useEffect, useState } from 'react'

interface Persona { name: string; specialty: string }
interface Pick { bountyId: string; rank: number; reasoning: string; confidence: number }

export function SpawnPersona() {
  const [persona, setPersona] = useState<Persona | null>(null)
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [picks, setPicks] = useState<Pick[] | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/persona/custom')
      .then((r) => r.json())
      .then((d: { persona: Persona | null }) => setPersona(d.persona))
      .catch(() => setPersona(null))
  }, [])

  async function create() {
    setBusy(true)
    setError(null)
    const res = await fetch('/api/persona/custom', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, specialty }),
    })
    const d = await res.json()
    if (!res.ok) setError(d.error ?? 'failed (tier 2 $GITB required)')
    else setPersona(d.persona)
    setBusy(false)
  }

  async function loadPicks() {
    setBusy(true)
    const res = await fetch('/api/persona/custom/picks')
    const d = await res.json()
    setPicks(res.ok ? d.picks : [])
    setBusy(false)
  }

  return (
    <div className="border border-border rounded-lg p-5 space-y-3 bg-surface/40">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
        spawn your own scout · tier 2 $GITB
      </div>
      {persona ? (
        <div className="space-y-3">
          <div className="font-mono text-sm text-primary">{persona.name}</div>
          <div className="text-xs text-muted">{persona.specialty}</div>
          <button
            onClick={loadPicks}
            disabled={busy}
            className="text-xs font-mono px-3 py-1.5 rounded border border-border hover:border-accent hover:text-accent disabled:opacity-40 transition"
          >
            {busy ? 'thinking…' : "show this week's picks"}
          </button>
          {picks && (
            <div className="space-y-1 text-xs text-muted font-mono">
              {picks.length === 0 ? (
                <div>no picks this week.</div>
              ) : (
                picks.map((p) => (
                  <div key={p.bountyId}>
                    <span className="text-accent">{p.rank}.</span> {p.reasoning}{' '}
                    <span className="text-muted">({Math.round(p.confidence * 100)}%)</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="persona name"
            maxLength={40}
            className="w-full bg-base/60 border border-border rounded px-3 py-2 text-sm font-mono"
          />
          <textarea
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="what should it hunt? (e.g. low-risk solidity audits under 500 $GITLAWB)"
            maxLength={280}
            className="w-full bg-base/60 border border-border rounded px-3 py-2 text-sm font-mono h-20"
          />
          <button
            onClick={create}
            disabled={busy || !name || !specialty}
            className="text-xs font-mono px-3 py-1.5 rounded border border-border hover:border-accent hover:text-accent disabled:opacity-40 transition"
          >
            {busy ? 'creating…' : 'create my scout'}
          </button>
          {error && <div className="text-xs text-status-disputed font-mono">{error}</div>}
        </div>
      )}
    </div>
  )
}
