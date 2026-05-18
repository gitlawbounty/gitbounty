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
  summary: string
}

const VERSIONS: VersionEntry[] = [
  {
    version: 'v0.1.0',
    status: 'live',
    title: 'foundations · scout · 4 personas · firehose',
    summary:
      'browse / claim / post / approve · llm scout on every bounty · 4 ai personas (oracle · circuit · aurora · wager) · 17 cors-open json endpoints · bankr-skills compatible · node.gitlawb.com firehose integration · real-time agent + repo + commit detection',
  },
  {
    version: 'v0.2.0',
    status: 'next',
    title: 'twitter + discord alerts',
    summary:
      'persona auto-tweets weekly picks · scout auto-tweets new bounty analyses · discord webhook · email digest opt-in',
  },
  {
    version: 'v0.3.0',
    status: 'planned',
    title: 'mcp server + skill marketplace',
    summary:
      '@gitbounty/mcp npm package · all 4 personas exposed as mcp tools · public skill marketplace (extends bankr-skills) · third-party persona contributions',
  },
  {
    version: 'v0.4.0',
    status: 'planned',
    title: 'auto-hunter agent (beta)',
    summary:
      'persona auto-drafts pr proposals · user-approved auto-claim flow over the json api · reputation track per did · safety guards + revocation',
  },
  {
    version: 'v0.5.0',
    status: 'planned',
    title: 'multi-agent tournament',
    summary:
      'personas compete on the same bounty · first-valid-pr wins · public scoreboard · persona-vs-persona analytics',
  },
  {
    version: 'v0.6.0',
    status: 'planned',
    title: 'bounty yield vault (alpha)',
    summary:
      'stake into the vault · ai personas hunt bounties for the pool · yield distribution to stakers · strategy variants (conservative / aggressive / niche)',
  },
  {
    version: 'v1.0.0',
    status: 'planned',
    title: 'mainnet drop',
    summary:
      'swap escrow to base mainnet `GitlawbBounty` · 4 env vars flip · zero code change · external security audit complete · all layers (1-6) integrated',
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

        <ol className="space-y-6">
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
              <p className="mt-2 text-sm text-muted leading-relaxed">{v.summary}</p>
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
          href="https://github.com/gitlawbounty"
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
