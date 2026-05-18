// Visit http://localhost:3000/logo-preview after `npm run dev`.
// Logos designed for the gitlawb ecosystem aesthetic:
// - White-dominant on near-black
// - Geometric line-art icon (not text-only)
// - Small color accent for highlight only
// - Banner: big wordmark + code snippet preview + status badge

const BG = '#0a0a0a'
const FG = '#ffffff'
const MUTED = '#71717a'
const BORDER = '#27272a'
const ACCENT_GREEN = '#10b981'
const ACCENT_CYAN = '#22d3ee'

export default function LogoPreviewPage() {
  return (
    <main style={{ background: '#000', padding: 48, minHeight: '100vh', fontFamily: 'monospace', color: FG }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>logo concepts v2 — matching gitlawb ecosystem aesthetic</h1>
      <p style={{ color: MUTED, marginBottom: 32 }}>
        white-dominant · geometric icons · small accent dots · code-snippet banners ·
        scroll & pick your favorite.
      </p>

      <Concept title="Concept 1 — Crosshair Target" tagline="bounty discovery for ai agents" accent={ACCENT_GREEN}>
        <Mark size={280}><Crosshair size={280} /></Mark>
        <Mark size={64}><Crosshair size={64} /></Mark>
        <Banner mark={<Crosshair size={170} />} accent={ACCENT_GREEN} />
      </Concept>

      <Concept title="Concept 2 — Hex + Bracket Glyph" tagline="bounty layer · built on gitlawb" accent={ACCENT_GREEN}>
        <Mark size={280}><HexBracket size={280} /></Mark>
        <Mark size={64}><HexBracket size={64} /></Mark>
        <Banner mark={<HexBracket size={170} />} accent={ACCENT_GREEN} />
      </Concept>

      <Concept title="Concept 3 — Coin / Token" tagline="open bounties · $GITLAWB rewards" accent={ACCENT_GREEN}>
        <Mark size={280}><CoinMark size={280} /></Mark>
        <Mark size={64}><CoinMark size={64} /></Mark>
        <Banner mark={<CoinMark size={170} />} accent={ACCENT_GREEN} />
      </Concept>

      <Concept title="Concept 4 — Branching Path to Target" tagline="paths to claimable bounties" accent={ACCENT_CYAN}>
        <Mark size={280}><BranchTarget size={280} /></Mark>
        <Mark size={64}><BranchTarget size={64} /></Mark>
        <Banner mark={<BranchTarget size={170} />} accent={ACCENT_CYAN} />
      </Concept>

      <Concept title="Concept 5 — Pulse + Dot" tagline="live bounty feed · base sepolia" accent={ACCENT_GREEN}>
        <Mark size={280}><Pulse size={280} /></Mark>
        <Mark size={64}><Pulse size={64} /></Mark>
        <Banner mark={<Pulse size={170} />} accent={ACCENT_GREEN} />
      </Concept>

      <Concept title="Concept 6 — Stacked Order Book" tagline="the bounty stack" accent={ACCENT_GREEN}>
        <Mark size={280}><Stack size={280} /></Mark>
        <Mark size={64}><Stack size={64} /></Mark>
        <Banner mark={<Stack size={170} />} accent={ACCENT_GREEN} />
      </Concept>

      <Concept title="Concept 7 — Window + GB" tagline="terminal-native bounty client" accent={ACCENT_GREEN}>
        <Mark size={280}><WindowGB size={280} /></Mark>
        <Mark size={64}><WindowGB size={64} /></Mark>
        <Banner mark={<WindowGB size={170} />} accent={ACCENT_GREEN} />
      </Concept>
    </main>
  )
}

/* ── concept wrapper ──────────────────────────────────────────────── */

function Concept({
  title,
  tagline,
  accent,
  children,
}: {
  title: string
  tagline: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 16, marginBottom: 2 }}>{title}</h2>
      <div style={{ color: MUTED, fontSize: 13, marginBottom: 16 }}>{tagline}</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

function Mark({ size, children }: { size: number; children: React.ReactNode }) {
  const containerSize = size === 280 ? 400 : 96
  const label = size === 280 ? 'PROFILE 400×400' : 'FAVICON 32×32 (rendered 64×64 padded)'
  return (
    <div>
      <div style={{ color: MUTED, fontSize: 10, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          width: containerSize,
          height: containerSize,
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: containerSize === 400 ? 12 : 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: size === 280 ? 40 : 16,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function Banner({ mark, accent }: { mark: React.ReactNode; accent: string }) {
  return (
    <div>
      <div style={{ color: MUTED, fontSize: 10, marginBottom: 4 }}>BANNER 1500×500 (preview 750×250)</div>
      <div
        style={{
          width: 750,
          height: 250,
          background: BG,
          border: `1px solid ${BORDER}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* corner status badge */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 24,
            fontSize: 10,
            color: MUTED,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          [ gitbounty · v0.1.0-alpha ]
        </div>
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 24,
            fontSize: 10,
            color: accent,
            letterSpacing: 2,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
          live · gitlawb network
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            padding: '0 32px',
            height: '100%',
          }}
        >
          <div style={{ flexShrink: 0 }}>{mark}</div>
          <div>
            <div style={{ fontSize: 56, fontWeight: 700, color: FG, letterSpacing: -2, lineHeight: 1 }}>
              gitbounty
            </div>
            <div style={{ fontSize: 14, color: MUTED, marginTop: 10, lineHeight: 1.5 }}>
              the bounty layer for @gitlawb
              <br />
              <span style={{ color: '#525252' }}>$ gl bounty list --status=open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── geometric marks (all white-stroke on transparent, ecosystem-aligned) ─── */

function Crosshair({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="38" fill="none" stroke={FG} strokeWidth="3" />
      <circle cx="50" cy="50" r="24" fill="none" stroke={FG} strokeWidth="3" />
      <line x1="50" y1="4" x2="50" y2="20" stroke={FG} strokeWidth="3" />
      <line x1="50" y1="80" x2="50" y2="96" stroke={FG} strokeWidth="3" />
      <line x1="4" y1="50" x2="20" y2="50" stroke={FG} strokeWidth="3" />
      <line x1="80" y1="50" x2="96" y2="50" stroke={FG} strokeWidth="3" />
      <circle cx="50" cy="50" r="6" fill={ACCENT_GREEN} />
    </svg>
  )
}

function HexBracket({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon
        points="50,8 86,30 86,70 50,92 14,70 14,30"
        fill="none"
        stroke={FG}
        strokeWidth="3.5"
        strokeLinejoin="miter"
      />
      <path d="M 36 38 L 30 38 L 30 62 L 36 62" fill="none" stroke={FG} strokeWidth="3.5" strokeLinejoin="miter" />
      <path d="M 64 38 L 70 38 L 70 62 L 64 62" fill="none" stroke={FG} strokeWidth="3.5" strokeLinejoin="miter" />
      <circle cx="50" cy="50" r="5" fill={ACCENT_GREEN} />
    </svg>
  )
}

function CoinMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="none" stroke={FG} strokeWidth="3.5" />
      <circle cx="50" cy="50" r="32" fill="none" stroke={FG} strokeWidth="1" strokeDasharray="2 3" />
      <path
        d="M 60 38 L 60 32 L 40 32 L 36 36 L 36 64 L 40 68 L 60 68 L 64 64 L 64 50 L 50 50 L 50 56 L 56 56"
        fill="none"
        stroke={FG}
        strokeWidth="3.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  )
}

function BranchTarget({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="20" cy="30" r="5" fill={FG} />
      <circle cx="20" cy="70" r="5" fill={FG} />
      <circle cx="50" cy="50" r="5" fill={FG} />
      <circle cx="80" cy="50" r="9" fill="none" stroke={FG} strokeWidth="3" />
      <circle cx="80" cy="50" r="3" fill={ACCENT_CYAN} />
      <line x1="22" y1="32" x2="48" y2="48" stroke={FG} strokeWidth="3" />
      <line x1="22" y1="68" x2="48" y2="52" stroke={FG} strokeWidth="3" />
      <line x1="55" y1="50" x2="71" y2="50" stroke={FG} strokeWidth="3" />
    </svg>
  )
}

function Pulse({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <line x1="8" y1="50" x2="22" y2="50" stroke={FG} strokeWidth="3.5" strokeLinecap="square" />
      <path
        d="M 22 50 L 30 50 L 36 30 L 44 70 L 52 16 L 60 84 L 68 30 L 74 50 L 92 50"
        fill="none"
        stroke={FG}
        strokeWidth="3.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      <circle cx="92" cy="50" r="5" fill={ACCENT_GREEN} />
    </svg>
  )
}

function Stack({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="14" y="22" width="58" height="8" fill={FG} />
      <rect x="14" y="36" width="44" height="8" fill={FG} fillOpacity="0.6" />
      <rect x="14" y="50" width="52" height="8" fill={FG} fillOpacity="0.6" />
      <rect x="14" y="64" width="36" height="8" fill={FG} fillOpacity="0.6" />
      <rect x="14" y="78" width="28" height="6" fill={FG} fillOpacity="0.35" />
      <circle cx="84" cy="26" r="5" fill={ACCENT_GREEN} />
    </svg>
  )
}

function WindowGB({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="14" y="20" width="72" height="60" fill="none" stroke={FG} strokeWidth="3.5" />
      <line x1="14" y1="32" x2="86" y2="32" stroke={FG} strokeWidth="3.5" />
      <circle cx="22" cy="26" r="2" fill={FG} />
      <circle cx="30" cy="26" r="2" fill={FG} />
      <circle cx="38" cy="26" r="2" fill={FG} />
      <text x="50" y="64" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="24" fill={FG}>
        gb
      </text>
      <circle cx="79" cy="73" r="3" fill={ACCENT_GREEN} />
    </svg>
  )
}
