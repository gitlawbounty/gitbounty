// Read DID registration events from GitlawbDIDRegistry on Base Sepolia.
// These are real on-chain events emitted whenever someone calls register() on the registry.

import { createPublicClient, http } from 'viem'
import { activeChain } from '@/lib/chains'
import { env } from '@/lib/env'
import { addresses } from '@/lib/contracts/addresses'
import { didRegistryAbi } from '@/lib/contracts/did-registry-abi'

const client = createPublicClient({
  chain: activeChain,
  transport: http(env.NEXT_PUBLIC_RPC_URL),
})

const MAX_BLOCK_RANGE = 9500n

// DIDRegistered event signature (from GitlawbDIDRegistry.sol):
// event DIDRegistered(bytes32 indexed didHash, address indexed owner, string did, string document)
// Need to extend the abi we have if it doesn't have the event yet.

const DID_REGISTERED_EVENT = {
  type: 'event',
  name: 'DIDRegistered',
  anonymous: false,
  inputs: [
    { name: 'didHash', type: 'bytes32', indexed: true },
    { name: 'owner', type: 'address', indexed: true },
    { name: 'did', type: 'string', indexed: false },
    { name: 'document', type: 'string', indexed: false },
  ],
} as const

const fullAbi = [...didRegistryAbi, DID_REGISTERED_EVENT] as const

export interface DidRegistrationEvent {
  kind: 'DIDRegistered'
  didHash: string
  owner: `0x${string}`
  did: string
  txHash: `0x${string}`
  blockNumber: bigint
}

export async function fetchDidRegistrations(
  windowBlocks = 50_000n,
): Promise<DidRegistrationEvent[]> {
  try {
    const latest = await client.getBlockNumber()
    const fromBlock = latest - windowBlocks > 0n ? latest - windowBlocks : 0n
    const events: DidRegistrationEvent[] = []
    let cursor = fromBlock
    while (cursor <= latest) {
      const end = cursor + MAX_BLOCK_RANGE > latest ? latest : cursor + MAX_BLOCK_RANGE
      const logs = (await client.getContractEvents({
        address: addresses.didRegistry,
        abi: fullAbi,
        eventName: 'DIDRegistered',
        fromBlock: cursor,
        toBlock: end,
      })) as unknown as Array<{
        args: { didHash: string; owner: `0x${string}`; did: string }
        transactionHash: `0x${string}`
        blockNumber: bigint
      }>
      for (const log of logs) {
        events.push({
          kind: 'DIDRegistered',
          didHash: log.args.didHash,
          owner: log.args.owner,
          did: log.args.did,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })
      }
      cursor = end + 1n
    }
    return events.sort((a, b) => Number(b.blockNumber - a.blockNumber))
  } catch {
    return []
  }
}
