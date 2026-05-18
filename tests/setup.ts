import '@testing-library/jest-dom/vitest'

// Provide test defaults so lib/env.ts validation passes during unit tests.
// These values are arbitrary — tests should NOT depend on them being real.
process.env.NEXT_PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ?? '84532'
process.env.NEXT_PUBLIC_BOUNTY_ADDRESS =
  process.env.NEXT_PUBLIC_BOUNTY_ADDRESS ?? '0x8fc59d42b56fc153bcb9f871aae8e32bcf530789'
process.env.NEXT_PUBLIC_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? '0x3ec2454eb02127f8410cad049875158b210967c6'
process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS ?? '0xddfad2d84cbff1c7078ee3f29b15614cba985c2e'
process.env.NEXT_PUBLIC_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? 'https://sepolia.base.org'
process.env.NEXT_PUBLIC_WSS_URL =
  process.env.NEXT_PUBLIC_WSS_URL ?? 'wss://sepolia.base.org'
process.env.NEXT_PUBLIC_DEPLOY_BLOCK = process.env.NEXT_PUBLIC_DEPLOY_BLOCK ?? '18000000'
process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'test-project-id'
