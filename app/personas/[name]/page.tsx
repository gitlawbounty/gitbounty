import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
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
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/personas" />

          <section className="pt-12 pb-8">
            <Link href="/personas" className="text-xs text-muted hover:text-accent">
              {'← all personas'}
            </Link>
            <div className="mt-6 flex items-baseline gap-5">
              <span className={`text-6xl ${ACCENT_CLASS[persona.accentColor]}`}>
                {persona.glyph}
              </span>
              <div>
                <h1 className="display text-5xl sm:text-6xl font-bold tracking-tight leading-none">
                  {persona.displayName}
                </h1>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
                  {persona.title}
                </div>
              </div>
            </div>
            <div className="mt-6 text-base text-primary max-w-2xl">{persona.tagline}</div>
            <div className="mt-2 text-sm text-muted italic">"{persona.catchphrase}"</div>
            <div className="mt-4 text-[11px] text-muted">
              specialty: <span className="text-primary">{persona.specialty}</span>
            </div>
          </section>
        </main>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div className="text-xs text-muted">
          <span className="text-accent">$</span> gl persona picks --week={'{current}'} --by=
          {persona.name}
        </div>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted">
            this week's picks from {persona.displayName}
          </h2>
          <PersonaPicks persona={persona} />
        </section>

        <div className="border-t border-border pt-4 text-[11px] text-muted">
          api:{' '}
          <Link
            href={`/api/persona/${persona.name}/picks`}
            className="text-accent hover:underline"
          >
            /api/persona/{persona.name}/picks
          </Link>
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
