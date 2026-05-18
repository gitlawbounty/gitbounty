import { NextResponse } from 'next/server'
import { fetchBounties } from '@/lib/bounty/read'
import { serializeBounty, commonHeaders } from '@/lib/api/serialize'

export const revalidate = 30
export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = Number.parseInt(id, 10)
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }
  const [b] = await fetchBounties([numId])
  if (!b) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(serializeBounty(b), { headers: commonHeaders('rpc') })
}
