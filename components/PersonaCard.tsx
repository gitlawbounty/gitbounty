import Link from 'next/link'
import type { Persona } from '@/lib/llm/personas'

const ACCENT_CLASS: Record<Persona['accentColor'], string> = {
  open: 'text-status-open',
  claimed: 'text-status-claimed',
  completed: 'text-status-completed',
  disputed: 'text-status-disputed',
}

export function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Link
      href={`/personas/${persona.name}`}
      className="block border border-border hover:border-accent p-4 transition group"
    >
      <div className="flex items-baseline gap-3">
        <span className={`text-2xl ${ACCENT_CLASS[persona.accentColor]}`}>{persona.glyph}</span>
        <div>
          <div className="text-base text-primary group-hover:text-accent">
            {persona.displayName}
          </div>
          <div className="text-xs text-muted uppercase tracking-wider">{persona.title}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-primary">{persona.tagline}</div>
      <div className="mt-2 text-xs text-muted italic">"{persona.catchphrase}"</div>
      <div className="mt-3 text-xs text-muted">{persona.specialty}</div>
    </Link>
  )
}
