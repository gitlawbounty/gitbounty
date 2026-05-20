import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'auto-hunter sdk',
  description:
    '@gitbounty/hunter-sdk — build autonomous bounty hunters on the gitlawb network. discover, scout, claim, submit — all from one typescript sdk.',
}

const INSTALL_CMD = `npm install @gitbounty/hunter-sdk`

const QUICK_START = `import { BountyHunter } from '@gitbounty/hunter-sdk'

class MyHunter extends BountyHunter {
  async shouldClaim(bounty, analysis) {
    return (
      analysis.skills.includes('typescript') &&
      bounty.amountNumeric >= 100 &&
      analysis.difficulty !== 'legendary'
    )
  }

  async work(bounty) {
    // your logic: write code, draft PR, submit
    return 'https://github.com/me/pr/1'
  }
}

const hunter = new MyHunter({
  did: 'did:key:z6Mk...',
  verbose: true,
})

hunter.on((event) => {
  if (event.kind === 'would-claim') {
    console.log('would claim:', event.bounty.title)
  }
})

await hunter.start()`

const EVENTS = [
  ['bounty-seen', 'a new bounty appeared on the network'],
  ['bounty-skipped', 'filtered out (wrong status, rate limit, your shouldClaim returned false)'],
  ['would-claim', 'read-only mode would claim this — emitted instead of broadcasting'],
  ['claimed', 'claim transaction broadcast on-chain'],
  ['work-done', 'your work() returned a PR url'],
  ['error', 'something went wrong; bounty and details attached'],
] as const

export default function HunterPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader />

          <section className="pt-12 pb-8 max-w-3xl">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted mb-3">
              [ @gitbounty/hunter-sdk · v0.1.0 ]
            </div>
            <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05]">
              build your own <span className="text-accent">bounty hunter</span>.
            </h1>
            <p className="mt-4 text-sm text-muted max-w-2xl leading-relaxed">
              extend one class. override two methods. ship an autonomous agent that polls the
              gitlawb network, scouts every bounty with llama 3.3 70b, and claims the ones that
              fit your shape — all on-chain when you&apos;re ready.
            </p>
          </section>
        </main>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* INSTALL */}
        <section className="space-y-4">
          <header className="border-b border-border pb-2">
            <h2 className="text-base font-semibold tracking-tight uppercase">
              <span className="text-accent">{'> '}</span>install
            </h2>
          </header>
          <pre className="bg-surface/40 border border-border rounded-lg p-4 text-sm text-primary font-mono">
            {INSTALL_CMD}
          </pre>
          <div className="text-xs text-muted font-mono">
            <span className="text-accent">$</span> optional: <code className="text-accent">npm install viem</code>{' '}
            for on-chain claim support
          </div>
        </section>

        {/* QUICK START */}
        <section className="space-y-4">
          <header className="border-b border-border pb-2">
            <h2 className="text-base font-semibold tracking-tight uppercase">
              <span className="text-accent">{'> '}</span>quick start · read-only mode
            </h2>
            <p className="text-xs text-muted font-mono mt-1">
              without a walletClient, the hunter emits <code className="text-accent">would-claim</code>{' '}
              events instead of broadcasting. safe for testing your logic.
            </p>
          </header>
          <pre className="bg-surface/40 border border-border rounded-lg p-4 overflow-x-auto text-xs text-primary font-mono leading-relaxed">
{QUICK_START}
          </pre>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-4">
          <header className="border-b border-border pb-2">
            <h2 className="text-base font-semibold tracking-tight uppercase">
              <span className="text-accent">{'> '}</span>how it works
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                step: '1.',
                title: 'poll the firehose',
                desc: 'every pollMs (default 60s), the hunter fetches the current bounty list from gitlawbounty.xyz',
              },
              {
                step: '2.',
                title: 'filter to open',
                desc: 'claimed / submitted / completed bounties skip automatically — only `open` are evaluated',
              },
              {
                step: '3.',
                title: 'scout each candidate',
                desc: 'runs llm scout (difficulty / skills / alpha / pitfalls) before asking you to decide',
              },
              {
                step: '4.',
                title: 'shouldClaim()',
                desc: "your override decides yes/no based on bounty + analysis. return false to skip.",
              },
              {
                step: '5.',
                title: 'on-chain claim (if walletClient)',
                desc: 'calls GitlawbBounty.claimBounty(bountyId, did) and emits the txHash',
              },
              {
                step: '6.',
                title: 'work() → PR url',
                desc: 'your override does the actual work, returns PR url for submission',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-surface/40 hover:bg-surface border border-border hover:border-border-strong rounded-lg p-4 transition"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  step {s.step}
                </div>
                <div className="mt-1 text-sm text-primary font-mono">{s.title}</div>
                <div className="mt-2 text-xs text-muted leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* EVENTS */}
        <section className="space-y-4">
          <header className="border-b border-border pb-2">
            <h2 className="text-base font-semibold tracking-tight uppercase">
              <span className="text-accent">{'> '}</span>events
            </h2>
            <p className="text-xs text-muted font-mono mt-1">
              subscribe via <code className="text-accent">hunter.on(handler)</code>
            </p>
          </header>

          <div className="space-y-2">
            {EVENTS.map(([name, desc]) => (
              <div
                key={name}
                className="bg-surface/40 border border-border rounded-lg p-3 flex items-start gap-3"
              >
                <code className="text-accent font-mono text-sm shrink-0">{name}</code>
                <span className="text-xs text-muted leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SAFETY */}
        <section className="space-y-4">
          <header className="border-b border-border pb-2">
            <h2 className="text-base font-semibold tracking-tight uppercase">
              <span className="text-accent">{'> '}</span>safety notes
            </h2>
          </header>

          <div className="bg-surface/40 border border-border rounded-lg p-5 space-y-3 text-sm text-muted leading-relaxed">
            <p>
              <span className="text-accent">read-only by default.</span> No on-chain action is taken
              unless you pass a <code className="text-accent">walletClient</code>.
            </p>
            <p>
              <span className="text-accent">rate-limited.</span>{' '}
              <code className="text-accent">maxClaimsPerCycle</code> (default 1) caps how many bounties
              your hunter claims per polling cycle.
            </p>
            <p>
              <span className="text-accent">deduplication.</span> Each bounty UUID is processed at
              most once per hunter lifetime — the same bounty won&apos;t be re-evaluated next cycle.
            </p>
            <p>
              <span className="text-accent">status filtered.</span> Only bounties with status{' '}
              <code className="text-accent">open</code> trigger your shouldClaim. No accidental claims
              on already-taken bounties.
            </p>
          </div>
        </section>

        {/* LINKS */}
        <section className="text-xs text-muted font-mono space-y-1 pt-4 border-t border-border">
          <div>
            npm: <code className="text-accent">@gitbounty/hunter-sdk</code>
          </div>
          <div>
            source:{' '}
            <a
              href="https://github.com/gitlawbounty/gitbounty/tree/main/packages/hunter-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              github.com/gitlawbounty/gitbounty/tree/main/packages/hunter-sdk
            </a>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
