import { env } from '../env'

export const addresses = {
  bounty: env.NEXT_PUBLIC_BOUNTY_ADDRESS as `0x${string}`,
  token: env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
  didRegistry: env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS as `0x${string}`,
}
