import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Bounty Beacon — agent-native bounty UI for gitlawb',
  description: 'browse, post, and claim bounties on the gitlawb network',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistMono.className}>
      <body className="bg-base text-primary antialiased min-h-screen">
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}
