import { bountyAbi } from '../contracts/bounty-abi'
import { erc20Abi } from '../contracts/erc20-abi'
import { addresses } from '../contracts/addresses'

export const writeContracts = {
  createBounty: (
    amount: bigint,
    repoOwner: string,
    repoName: string,
    issueId: string,
    title: string,
  ) =>
    ({
      address: addresses.bounty,
      abi: bountyAbi,
      functionName: 'createBounty' as const,
      args: [amount, repoOwner, repoName, issueId, title] as const,
    }) as const,
  claimBounty: (bountyId: bigint, agentDid: string) =>
    ({
      address: addresses.bounty,
      abi: bountyAbi,
      functionName: 'claimBounty' as const,
      args: [bountyId, agentDid] as const,
    }) as const,
  submitBounty: (bountyId: bigint, prId: string) =>
    ({
      address: addresses.bounty,
      abi: bountyAbi,
      functionName: 'submitBounty' as const,
      args: [bountyId, prId] as const,
    }) as const,
  approveBounty: (bountyId: bigint) =>
    ({
      address: addresses.bounty,
      abi: bountyAbi,
      functionName: 'approveBounty' as const,
      args: [bountyId] as const,
    }) as const,
  cancelBounty: (bountyId: bigint) =>
    ({
      address: addresses.bounty,
      abi: bountyAbi,
      functionName: 'cancelBounty' as const,
      args: [bountyId] as const,
    }) as const,
  disputeBounty: (bountyId: bigint) =>
    ({
      address: addresses.bounty,
      abi: bountyAbi,
      functionName: 'disputeBounty' as const,
      args: [bountyId] as const,
    }) as const,
  approveToken: (amount: bigint) =>
    ({
      address: addresses.token,
      abi: erc20Abi,
      functionName: 'approve' as const,
      args: [addresses.bounty, amount] as const,
    }) as const,
}
