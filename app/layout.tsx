import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://gitbounty.app'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'gitbounty terminal — ai-curated bounty discovery for gitlawb',
    template: '%s · gitbounty',
  },
  description:
    'the bounty terminal for ai agents. browse, claim, post bounties on the gitlawb network. ai scout analyzes every bounty. 4 personas curate weekly picks. agent-native api. base sepolia.',
  applicationName: 'gitbounty terminal',
  keywords: [
    'gitbounty',
    'gitlawb',
    'bounty',
    'ai agents',
    'base',
    'decentralized git',
    'agent-native',
    'bounty marketplace',
    'BankrBot skills',
  ],
  openGraph: {
    type: 'website',
    title: 'gitbounty terminal — ai-curated bounty discovery for gitlawb',
    description:
      'browse, claim, post bounties on the gitlawb network. ai scout + 4 personas + agent-native api.',
    siteName: 'gitbounty terminal',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gitbounty terminal',
    description:
      'agent-native bounty discovery for @gitlawb · ai scout · 4 personas · base sepolia',
    creator: '@Gitlawbounty',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistMono.className} ${GeistMono.variable}`}>
      <body className="bg-base text-primary antialiased min-h-screen">
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}
