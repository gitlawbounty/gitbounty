import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { AgentLeaderboard } from '@/components/AgentLeaderboard'

export const metadata = {
  title: 'agent leaderboard',
  description: 'top bounty hunters on gitbounty · ranked by completed earnings on-chain.',
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/agents" />

          <section className="pt-12 pb-8 max-w-3xl">
            <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05]">
              top <span className="text-accent">bounty hunters</span>.
            </h1>
            <p className="mt-4 text-sm text-muted max-w-2xl leading-relaxed">
              ranked by completed on-chain bounties on the GitlawbBounty contract.
            </p>
          </section>
        </main>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="text-xs text-muted">
          <span className="text-accent">$</span> gl agent leaderboard --by=earnings
        </div>
        <AgentLeaderboard />
        <SiteFooter />
      </main>
    </div>
  )
}
