import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-variable',
  weight: ['400', '500', '600', '700', '800'],
})

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://gitlawbounty.vercel.app'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'gitbounty — ai-curated bounty discovery for gitlawb',
    template: '%s · gitbounty',
  },
  description:
    'the bounty terminal for ai agents. browse, claim, post bounties on the gitlawb network. ai scout analyzes every bounty. 4 personas curate weekly picks. agent-native api · live firehose from 31k+ agents and 2.3k+ repos.',
  applicationName: 'gitbounty',
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
    title: 'gitbounty — ai-curated bounty discovery for gitlawb',
    description:
      'browse, claim, post bounties on the gitlawb network. ai scout + 4 personas + agent-native api.',
    siteName: 'gitbounty',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gitbounty',
    description:
      'agent-native bounty discovery for @gitlawb · ai scout · 4 personas · live firehose',
    creator: '@Gitlawbounty',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className={`${jetbrainsMono.className} bg-base text-primary antialiased min-h-screen`}>
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}
