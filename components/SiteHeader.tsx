'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WalletButton } from './WalletButton'

interface Props {
  activePath?: string
}

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'bounties', href: '/' },
  { label: 'live', href: '/live' },
  { label: 'personas', href: '/personas' },
  { label: 'agents', href: '/agents' },
  { label: 'repos', href: '/repos' },
  { label: 'docs', href: '/docs' },
]

// Developer / agent tooling — grouped under a "build" dropdown to keep the nav lean.
const BUILD_LINKS: { label: string; href: string; desc: string }[] = [
  { label: 'mcp', href: '/mcp', desc: 'model context protocol server' },
  { label: 'hunter', href: '/hunter', desc: 'auto-hunter sdk' },
]

export function SiteHeader({ activePath }: Props) {
  const [buildOpen, setBuildOpen] = useState(false)
  const buildActive = BUILD_LINKS.some((l) => l.href === activePath)

  return (
    <header className="space-y-4">
      {/* Top status bar — mono, very thin */}
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
        <span>[ gitbounty terminal · v0.1.0-alpha ]</span>
        <span className="flex items-center gap-2 text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          live · gitlawb network
        </span>
      </div>

      {/* Brand row */}
      <div className="flex items-center justify-between flex-wrap gap-6 pt-2">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="gitbounty"
            width={44}
            height={44}
            className="rounded-md"
            priority
          />
          <div>
            <div className="text-2xl font-semibold tracking-tight group-hover:text-accent transition">
              gitbounty
            </div>
            <div className="text-xs font-mono text-muted mt-0.5">
              ai-curated bounty terminal
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 flex-wrap text-sm font-mono">
          {NAV_LINKS.map((link) => {
            const isActive = activePath === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded transition ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-primary hover:bg-border/40'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {/* build ▾ — groups the @gitbounty/* dev tools */}
          <div
            className="relative"
            onMouseEnter={() => setBuildOpen(true)}
            onMouseLeave={() => setBuildOpen(false)}
          >
            <button
              type="button"
              onClick={() => setBuildOpen((v) => !v)}
              aria-expanded={buildOpen}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1 ${
                buildActive || buildOpen
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:text-primary hover:bg-border/40'
              }`}
            >
              build
              <span className={`text-[10px] transition-transform ${buildOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>

            {buildOpen && (
              <div className="absolute right-0 top-full mt-1 w-60 rounded-lg border border-border bg-surface shadow-lg z-50 p-1">
                {BUILD_LINKS.map((link) => {
                  const isActive = activePath === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setBuildOpen(false)}
                      className={`block rounded px-3 py-2 transition ${
                        isActive ? 'bg-accent/10 text-accent' : 'hover:bg-border/40'
                      }`}
                    >
                      <span className={isActive ? 'text-accent' : 'text-primary'}>{link.label}</span>
                      <span className="block text-[11px] text-muted mt-0.5">{link.desc}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/post"
            className="rounded bg-accent text-base font-medium px-3.5 py-2 hover:bg-accent/90 transition"
          >
            post a bounty
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
