import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0a',
        primary: '#e5e5e5',
        muted: '#71717a',
        accent: '#10b981',
        'status-open': '#10b981',
        'status-claimed': '#f59e0b',
        'status-completed': '#22d3ee',
        'status-disputed': '#f43f5e',
        'status-cancelled': '#71717a',
        border: '#27272a',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
}
export default config
