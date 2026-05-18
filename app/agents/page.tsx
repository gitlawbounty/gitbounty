import Link from 'next/link'
import { AgentLeaderboard } from '@/components/AgentLeaderboard'

export default function AgentsPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
      <Link href="/" className="text-muted hover:text-accent text-sm">
        {'< back'}
      </Link>
      <h1 className="text-2xl">$ gl agent leaderboard</h1>
      <AgentLeaderboard />
    </main>
  )
}
