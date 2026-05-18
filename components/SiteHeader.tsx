'use client'

import Link from 'next/link'
import Image from 'next/image'
import { WalletButton } from './WalletButton'

interface Props {
  activePath?: string
}

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'bounties', href: '/' },
  { label: 'personas', href: '/personas' },
  { label: 'agents', href: '/agents' },
  { label: 'my', href: '/my' },
  { label: 'roadmap', href: '/roadmap' },
]

export function SiteHeader({ activePath }: Props) {
  return (
    <header className="space-y-4">
      {/* Top status bar */}
      <div className="flex items-center justify-between text-xs text-muted uppercase tracking-[0.2em]">
        <span>[ gitbounty terminal · v0.1.0-alpha ]</span>
        <span className="flex items-center gap-2 text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          live · base sepolia
        </span>
      </div>

      {/* Brand + nav row */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-t border-border pt-4">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="gitbounty"
            width={40}
            height={40}
            className="rounded-md"
            priority
          />
          <div>
            <div className="text-xl font-bold leading-none group-hover:text-accent transition">
              gitbounty
            </div>
            <div className="text-[10px] text-muted uppercase tracking-[0.2em] mt-1">
              ai-curated bounty terminal
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 flex-wrap text-sm">
          {NAV_LINKS.map((link) => {
            const isActive = activePath === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 border transition ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-primary'
                }`}
              >
                [ {link.label} ]
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/post"
            className="border border-accent text-accent px-3 py-1.5 text-sm hover:bg-accent hover:text-base"
          >
            [ post a bounty ]
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
