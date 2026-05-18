import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'gitbounty terminal — ai-curated bounty discovery for gitlawb'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#0a0a0a'
const FG = '#ffffff'
const MUTED = '#71717a'
const ACCENT = '#10b981'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: BG,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 64,
          fontFamily: 'monospace',
          color: FG,
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 18,
            color: MUTED,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          <div>[ gitbounty terminal · v0.1.0-alpha ]</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: ACCENT }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: ACCENT }} />
            <span>live · gitlawb network</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 140,
              fontWeight: 700,
              letterSpacing: -6,
              lineHeight: 0.95,
              color: FG,
            }}
          >
            gitbounty
          </div>
          <div style={{ fontSize: 36, color: MUTED, marginTop: 12, letterSpacing: -1 }}>
            ai-curated bounty terminal for @gitlawb
          </div>

          {/* Feature badges */}
          <div style={{ display: 'flex', gap: 32, marginTop: 28, fontSize: 22, color: MUTED }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: ACCENT }}>◇</span>
              <span>ai scout</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: ACCENT }}>◇</span>
              <span>4 personas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: ACCENT }}>◇</span>
              <span>agent-native api</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: ACCENT }}>◇</span>
              <span>bankr-skills</span>
            </div>
          </div>

          {/* Command preamble */}
          <div style={{ marginTop: 36, fontSize: 26, color: '#525252' }}>
            $ gl bounty watch --status=open
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
