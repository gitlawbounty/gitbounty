import Link from 'next/link'
import { PERSONAS } from '@/lib/llm/personas'
import { PersonaCard } from '@/components/PersonaCard'

export const metadata = {
  title: 'Personas — Gitbounty',
  description: 'Meet the AI bounty scouts: Sasha, Rana, Frieren, and Diego.',
}

export default function PersonasPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
      <Link href="/" className="text-muted hover:text-accent text-sm">
        {'< back'}
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl">
          <span className="text-accent">◇</span> bounty personas
        </h1>
        <div className="text-muted text-sm">
          $ ls /personas — four ai scouts, four specialties, one terminal
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(PERSONAS).map((p) => (
          <PersonaCard key={p.name} persona={p} />
        ))}
      </div>

      <div className="border-t border-border pt-6 text-xs text-muted space-y-2">
        <div>each persona is a Llama 3.3 70B instance with a distinct system prompt.</div>
        <div>weekly picks generated on demand, cached at the edge for ~1 hour.</div>
        <div>compatible with the <Link href="https://github.com/BankrBot/skills" className="text-accent">BankrBot/skills</Link> format — see <code className="text-accent">/skills/persona-pick</code>.</div>
      </div>
    </main>
  )
}
