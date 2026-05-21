import { NextResponse } from 'next/server'
import { getSessionTier } from '@/lib/auth/server'
import { boostBounty, getMyBoost, getActiveBoosts } from '@/lib/boost/store'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { address } = getSessionTier(req)
  const active = [...(await getActiveBoosts())]
  const mine = address ? await getMyBoost(address) : null
  return NextResponse.json({ active, mine })
}

export async function POST(req: Request) {
  const { address, tier } = getSessionTier(req)
  if (!address) return new Response('unauthorized', { status: 401 })
  if (tier < 1) return NextResponse.json({ error: 'tier 1 ($GITB) required' }, { status: 403 })

  const { bountyId } = (await req.json()) as { bountyId?: string }
  if (!bountyId || typeof bountyId !== 'string') {
    return NextResponse.json({ error: 'bountyId required' }, { status: 400 })
  }
  await boostBounty(address, bountyId)
  return NextResponse.json({ ok: true, boosted: bountyId })
}
