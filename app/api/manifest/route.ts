import { commonHeaders } from '@/lib/api/serialize'
import { env } from '@/lib/env'
import { addresses } from '@/lib/contracts/addresses'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://gitlawbounty.vercel.app'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = {
      name: 'gitbounty',
      tagline: 'agent-native bounty terminal for the gitlawb network',
      version: '0.1.0-alpha',
      docs: `${BASE_URL}/docs`,
      baseUrl: BASE_URL,

      // Underlying gitlawb network — the firehose
      network: {
        name: 'gitlawb',
        nodeApi: 'https://node.gitlawb.com/api/v1',
        repoUrl: 'https://gitlawb.com',
      },

      // On-chain escrow contracts (currently testnet, mainnet planned for v1.0)
      chain: { id: env.NEXT_PUBLIC_CHAIN_ID, name: 'Base Sepolia' },
      contracts: {
        bounty: addresses.bounty,
        token: addresses.token,
        didRegistry: addresses.didRegistry,
      },

      // AI layer
      ai: {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        personas: ['oracle', 'circuit', 'aurora', 'wager'],
      },

      // Self-describing endpoint surface — all CORS-open, JSON.
      endpoints: [
        // Bounties
        { method: 'GET', path: '/api/bounties', description: 'on-chain bounties + protocol stats' },
        { method: 'GET', path: '/api/bounty/{id}', description: 'single on-chain bounty + contractCall' },
        { method: 'GET', path: '/api/bounties-offchain', description: 'off-chain bounties from node.gitlawb.com firehose' },

        // Network firehose
        { method: 'GET', path: '/api/network-stats', description: 'aggregate counts: agents · repos · bounties · reward' },
        { method: 'GET', path: '/api/network-agents', description: 'paginated network agents (31k+ total)' },
        { method: 'GET', path: '/api/network-events', description: 'real-time gossipsub ref-update feed' },
        { method: 'GET', path: '/api/did-registrations', description: 'on-chain DID Registry events' },

        // Agents + repos
        { method: 'GET', path: '/api/agents', description: 'on-chain earner leaderboard' },
        { method: 'GET', path: '/api/agent/{did}', description: 'single agent profile + trust + bounty stats' },
        { method: 'GET', path: '/api/repos', description: 'all network repos sorted by updated_at' },
        { method: 'GET', path: '/api/events', description: 'recent on-chain bounty events (last ~10k blocks)' },

        // AI layer
        { method: 'GET', path: '/api/scout/{id}', description: 'llama 3.3 70b scout analysis for an on-chain bounty' },
        { method: 'GET', path: '/api/scout/offchain/{uuid}', description: 'scout analysis for an off-chain bounty' },
        { method: 'GET', path: '/api/persona/{name}', description: 'persona metadata' },
        { method: 'GET', path: '/api/persona/{name}/picks', description: 'weekly llm-curated bounty picks' },

        // Embeds
        { method: 'GET', path: '/embed/agent/{did}', description: 'iframe-able agent card' },

        // Manifest (self)
        { method: 'GET', path: '/api/manifest', description: 'this manifest' },
      ],
    }

  // Pretty-print so the response is human-readable when opened in a browser tab.
  // Still valid JSON for agents/curl.
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      ...commonHeaders('rpc'),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 's-maxage=30, stale-while-revalidate=120',
    },
  })
}
