import { NextResponse } from 'next/server'
import { isAddress } from 'viem'
import { buildLoginMessage, recoverIsValid } from '@/lib/auth/siwe'
import { gitbBalanceWhole } from '@/lib/token/gitb'
import { resolveTier } from '@/lib/token/tier'
import { signSession } from '@/lib/auth/session'
import { authSecret } from '@/lib/auth/secret'

export const dynamic = 'force-dynamic'

const T1 = Number(process.env.GITB_T1 ?? Infinity)
const T2 = Number(process.env.GITB_T2 ?? Infinity)
const SESSION_MS = 30 * 60 * 1000

export async function POST(req: Request) {
  const { address, nonce, signature } = (await req.json()) as {
    address?: string
    nonce?: string
    signature?: `0x${string}`
  }
  if (!address || !nonce || !signature) return new Response('bad request', { status: 400 })
  if (!isAddress(address)) return new Response('invalid address', { status: 400 })

  const message = buildLoginMessage(address, nonce)
  if (!(await recoverIsValid(address, message, signature))) {
    return new Response('invalid signature', { status: 401 })
  }

  const balance = await gitbBalanceWhole(address)
  const tier = resolveTier(balance, T1, T2)
  const token = signSession(
    { address, tier, exp: Date.now() + SESSION_MS },
    authSecret(),
  )

  const res = NextResponse.json({ address, tier, balance })
  res.cookies.set('gitb_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MS / 1000,
    path: '/',
  })
  return res
}
