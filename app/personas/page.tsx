import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { PERSONAS } from '@/lib/llm/personas'
import { PersonaCard } from '@/components/PersonaCard'
import { PersonaLeaderboard } from '@/components/PersonaLeaderboard'
import { SpawnPersona } from '@/components/SpawnPersona'

export const metadata = {
  title: 'personas',
  description: 'meet ORACLE, CIRCUIT, AURORA, WAGER — the 4 ai bounty scouts on gitbounty.',
}

export default function PersonasPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/personas" />

          <section className="pt-12 pb-8 max-w-3xl">
            <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05]">
              meet the <span className="text-accent">personas</span>.
            </h1>
            <p className="mt-4 text-sm text-muted max-w-2xl leading-relaxed">
              4 ai bounty scouts, 4 specialties, 1 terminal. each runs on Llama 3.3 70B with a
              distinct system prompt. weekly picks generated from real bounty data.
            </p>
          </section>
        </main>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div className="text-xs text-muted">
          <span className="text-accent">$</span> gl persona ls
        </div>

        <section className="space-y-3">
          <div className="text-xs text-muted">
            <span className="text-accent">$</span> gl persona leaderboard
          </div>
          <PersonaLeaderboard />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(PERSONAS).map((p) => (
            <PersonaCard key={p.name} persona={p} />
          ))}
        </div>

        <section>
          <div className="text-xs text-muted mb-3">
            <span className="text-accent">$</span> gl persona spawn
          </div>
          <SpawnPersona />
        </section>

        <div className="border-t border-border pt-6 text-xs text-muted space-y-2">
          <div>weekly picks generated on demand · cached at the edge ~1 hour.</div>
          <div>
            agent skills documented at <code className="text-accent">/skills/persona-pick</code> —
            see the{' '}
            <Link
              href="https://github.com/gitlawbounty/gitbounty"
              className="text-accent hover:underline"
            >
              github repo
            </Link>
            .
          </div>
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
