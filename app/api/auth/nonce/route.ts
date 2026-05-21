import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  const nonce = randomBytes(16).toString('hex')
  return NextResponse.json({ nonce })
}
