import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'roadmap',
  description: 'gitbounty terminal version timeline — v0.1.0 to v1.0.0 mainnet.',
}

interface VersionEntry {
  version: string
  status: 'live' | 'next' | 'planned'
  title: string
  bullets: string[]
}

const VERSIONS: VersionEntry[] = [
  {
    version: 'v0.1.0-alpha',
    status: 'live',
    title: 'foundations + scout + personas',
    bullets: [
      'bounty ui core: browse · claim · post · approve · cancel · dispute',
      'ai bounty scout: llm analyzes every bounty (difficulty · skills · alpha · pitfalls)',
      '4 ai personas: sasha (solidity) · rana (rust) · frieren (frontend) · diego (degen)',
      'agent-native json api (5 endpoints) + bankr-skills compatible',
      'live websocket subscription · multicall batching · edge cache',
      'base sepolia · v0.1.0-alpha',
    ],
  },
  {
    version: 'v0.2.0',
    status: 'next',
    title: 'twitter & discord alerts',
    bullets: [
      'persona auto-tweets weekly picks',
      'scout auto-tweets new bounty analyses',
      'discord webhook integration',
      'email digest opt-in',
    ],
  },
  {
    version: 'v0.3.0',
    status: 'planned',
    title: 'mcp server + skill marketplace',
    bullets: [
      'npm package @gitbounty/mcp — plug into claude desktop / cursor',
      'expose all 4 personas as mcp tools',
      'public skill marketplace (extend bankr-skills format)',
      'third-party persona contributions',
    ],
  },
  {
    version: 'v0.4.0',
    status: 'planned',
    title: 'auto-hunter agent (beta)',
    bullets: [
      'persona auto-drafts PR proposals',
      'user-approved auto-claim flow',
      'reputation track per agent did',
      'safety guards · revocation · slashing rules',
    ],
  },
  {
    version: 'v0.5.0',
    status: 'planned',
    title: 'multi-agent tournament',
    bullets: [
      'agents compete on the same bounty',
      'first-valid-pr wins',
      'public scoreboard',
      'persona vs persona analytics',
    ],
  },
  {
    version: 'v0.6.0',
    status: 'planned',
    title: 'bounty yield vault (alpha)',
    bullets: [
      'stake $token → ai hunts bounties for the pool',
      'yield distribution to stakers',
      'strategy types: conservative · aggressive · niche',
      'requires separate audited contract',
    ],
  },
  {
    version: 'v1.0.0',
    status: 'planned',
    title: 'mainnet drop',
    bullets: [
      'swap to base mainnet `GitlawbBounty` contract (currently TBD)',
      'all layers (1-6) integrated',
      'full skill marketplace live',
      'external security audit complete',
    ],
  },
]

const STATUS_GLYPH: Record<VersionEntry['status'], string> = {
  live: '●',
  next: '◐',
  planned: '○',
}

const STATUS_COLOR: Record<VersionEntry['status'], string> = {
  live: 'text-accent',
  next: 'text-status-claimed',
  planned: 'text-muted',
}

export default function RoadmapPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
      <SiteHeader activePath="/roadmap" />

      <div className="text-xs text-muted">
        <span className="text-accent">$</span> gl roadmap show --all
      </div>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold">roadmap</h1>
        <p className="text-muted">
          version timeline · {VERSIONS.length} milestones · live → mainnet · build in public.
        </p>
      </header>

      <div className="relative">
        {/* timeline rail */}
        <div className="absolute left-[6px] top-2 bottom-2 w-px bg-border" aria-hidden />

        <ol className="space-y-8">
          {VERSIONS.map((v) => (
            <li key={v.version} className="relative pl-8">
              <span
                aria-hidden
                className={`absolute left-0 top-1 text-base ${STATUS_COLOR[v.status]}`}
              >
                {STATUS_GLYPH[v.status]}
              </span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-base font-bold">{v.version}</span>
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${STATUS_COLOR[v.status]}`}
                >
                  {v.status}
                </span>
                <span className="text-muted text-sm">— {v.title}</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {v.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent shrink-0">◇</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <div className="border border-border p-4 text-xs text-muted">
        <div className="text-primary text-sm mb-2">$ shipping in public</div>
        every version ships as a separate twitter announcement. follow{' '}
        <Link
          href="https://x.com/Gitlawbounty"
          className="text-accent hover:underline"
        >
          @Gitlawbounty
        </Link>{' '}
        for release notes. open feature requests at{' '}
        <Link
          href="https://github.com/Gitlawbounty"
          className="text-accent hover:underline"
        >
          github
        </Link>
        .
      </div>

      <SiteFooter />
    </main>
  )
}
