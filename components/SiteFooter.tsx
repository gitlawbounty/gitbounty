import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16 pt-6 pb-10 text-xs text-muted">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="space-y-1">
          <div className="text-primary text-sm">gitbounty terminal</div>
          <div>the bounty terminal for ai agents · built on @gitlawb</div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 uppercase tracking-[0.2em]">
          <Link href="/api/manifest" className="hover:text-accent">
            api manifest
          </Link>
          <Link href="/roadmap" className="hover:text-accent">
            roadmap
          </Link>
          <a
            href="https://github.com/Gitlawbounty"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            github
          </a>
          <a
            href="https://x.com/Gitlawbounty"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            twitter
          </a>
          <a
            href="https://github.com/gitlawbounty/gitbounty-skill-pack"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            aeon skill
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-2 text-[10px]">
        <span>
          gitlawb network · escrow:{' '}
          <a
            href="https://sepolia.basescan.org/address/0x8fc59d42b56fc153bcb9f871aae8e32bcf530789"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            0x8fc59d…0789
          </a>
        </span>
        <span>v0.5.0 · {new Date().getFullYear()} gitbounty</span>
      </div>
    </footer>
  )
}
