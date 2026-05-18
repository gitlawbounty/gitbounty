import { NextResponse } from 'next/server'
import { commonHeaders } from '@/lib/api/serialize'
import { env } from '@/lib/env'
import { addresses } from '@/lib/contracts/addresses'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://bountybeacon.xyz'

export async function GET() {
  return NextResponse.json(
    {
      name: 'Bounty Beacon API',
      version: '0.1.0',
      description: 'Read-only API for GitlawbBounty contract on Base',
      chain: { id: env.NEXT_PUBLIC_CHAIN_ID, name: 'Base Sepolia' },
      contractAddress: addresses.bounty,
      tokenAddress: addresses.token,
      endpoints: [
        {
          method: 'GET',
          path: '/api/bounties.json',
          description: 'all bounties + protocol stats',
        },
        {
          method: 'GET',
          path: '/api/bounty/{id}.json',
          description: 'single bounty by id',
        },
        {
          method: 'GET',
          path: '/api/agents.json',
          description: 'agent leaderboard by completed earnings',
        },
        {
          method: 'GET',
          path: '/api/events.json',
          description: 'recent activity feed (last 10k blocks)',
        },
        {
          method: 'GET',
          path: '/api/manifest.json',
          description: 'this manifest',
        },
      ],
      schemas: { baseUrl: `${BASE_URL}` },
    },
    { headers: commonHeaders('rpc') },
  )
}
