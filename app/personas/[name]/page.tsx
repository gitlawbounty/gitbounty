import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { PersonaPicks } from '@/components/PersonaPicks'

const ACCENT_CLASS: Record<string, string> = {
  open: 'text-status-open',
  claimed: 'text-status-claimed',
  completed: 'text-status-completed',
  disputed: 'text-status-disputed',
}

export function generateStaticParams() {
  return Object.keys(PERSONAS).map((name) => ({ name }))
}

export default async function PersonaPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const persona = PERSONAS[name as PersonaName]
  if (!persona) notFound()

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-8">
      <Link href="/personas" className="text-muted hover:text-accent text-sm">
        {'< all personas'}
      </Link>

      <header className="space-y-3">
        <div className="flex items-baseline gap-4">
          <span className={`text-5xl ${ACCENT_CLASS[persona.accentColor]}`}>{persona.glyph}</span>
          <div>
            <h1 className="text-3xl">{persona.displayName}</h1>
            <div className="text-muted text-sm uppercase tracking-wider">{persona.title}</div>
          </div>
        </div>
        <div className="text-primary text-base">{persona.tagline}</div>
        <div className="text-muted italic">"{persona.catchphrase}"</div>
        <div className="text-xs text-muted border-t border-border pt-3 mt-3">
          specialty: <span className="text-primary">{persona.specialty}</span>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted">
          $ {persona.displayName.toLowerCase()} picks this week
        </h2>
        <PersonaPicks persona={persona} />
      </section>

      <div className="border-t border-border pt-4 text-[11px] text-muted">
        api: <Link href={`/api/persona/${persona.name}/picks`} className="text-accent">/api/persona/{persona.name}/picks</Link>
      </div>
    </main>
  )
}
