import { verifyMessage } from 'viem'

/** Human-readable login message the wallet signs. */
export function buildLoginMessage(address: string, nonce: string): string {
  return [
    'gitbounty wants you to sign in with your wallet.',
    '',
    `address: ${address}`,
    `nonce: ${nonce}`,
    'this proves you control this wallet. it does not move any funds.',
  ].join('\n')
}

/** True if `signature` over `message` recovers to `address`. */
export async function recoverIsValid(
  address: string,
  message: string,
  signature: `0x${string}`,
): Promise<boolean> {
  try {
    return await verifyMessage({ address: address as `0x${string}`, message, signature })
  } catch {
    return false
  }
}
