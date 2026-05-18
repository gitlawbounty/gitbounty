'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { parseUnits } from 'viem'
import { useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'
import { writeContracts } from '@/lib/bounty/write'
import { useWriteAction } from '@/hooks/useWriteAction'
import { addresses } from '@/lib/contracts/addresses'
import { erc20Abi } from '@/lib/contracts/erc20-abi'

const schema = z.object({
  amount: z.coerce.number().positive(),
  repoOwner: z.string().min(1),
  repoName: z.string().regex(/^[a-z0-9-]+$/, 'lowercase alphanumeric + hyphens'),
  issueId: z.string().min(1),
  title: z.string().min(1).max(100),
})
type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

type Stage = 'idle' | 'approving' | 'creating' | 'done'

export function PostBountyForm() {
  const router = useRouter()
  const { address } = useAccount()
  const [stage, setStage] = useState<Stage>('idle')
  const { writeContract, isPending, isConfirming, isSuccess } = useWriteAction()

  const { data: allowance } = useReadContract({
    address: addresses.token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, addresses.bounty] : undefined,
    query: { enabled: !!address },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
  })

  const amount = watch('amount')
  const amountWei = amount ? parseUnits(amount.toString(), 18) : 0n
  const hasAllowance =
    allowance !== undefined && amountWei > 0n && (allowance as bigint) >= amountWei

  // After approve confirms, auto-trigger create
  useEffect(() => {
    if (stage === 'approving' && isSuccess) {
      const data = watch()
      setStage('creating')
      writeContract(
        writeContracts.createBounty(
          amountWei,
          data.repoOwner,
          data.repoName,
          data.issueId,
          data.title,
        ),
      )
    }
  }, [stage, isSuccess, watch, writeContract, amountWei])

  // After create confirms, redirect
  useEffect(() => {
    if (stage === 'creating' && isSuccess) {
      setStage('done')
      router.push('/')
    }
  }, [stage, isSuccess, router])

  const onSubmit = handleSubmit((data) => {
    if (!hasAllowance) {
      setStage('approving')
      writeContract(writeContracts.approveToken(amountWei))
    } else {
      setStage('creating')
      writeContract(
        writeContracts.createBounty(
          amountWei,
          data.repoOwner,
          data.repoName,
          data.issueId,
          data.title,
        ),
      )
    }
  })

  const busy = isPending || isConfirming

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <Field label="amount ($GITLAWB)" error={errors.amount?.message}>
        <input type="number" step="0.01" {...register('amount')} className={inputClass} />
      </Field>
      <Field label="repo owner (DID or address)" error={errors.repoOwner?.message}>
        <input
          {...register('repoOwner')}
          placeholder="did:gitlawb:z6Mk..."
          className={inputClass}
        />
      </Field>
      <Field label="repo name" error={errors.repoName?.message}>
        <input {...register('repoName')} placeholder="my-project" className={inputClass} />
      </Field>
      <Field label="issue id" error={errors.issueId?.message}>
        <input {...register('issueId')} placeholder="42" className={inputClass} />
      </Field>
      <Field label="title (max 100)" error={errors.title?.message}>
        <input {...register('title')} className={inputClass} />
      </Field>

      <div className="text-sm text-muted h-5">
        {stage === 'approving' && 'step 1/2: approving token...'}
        {stage === 'creating' && 'step 2/2: creating bounty...'}
        {stage === 'idle' && !hasAllowance && !!amount && 'requires approval first'}
      </div>

      <Button type="submit" disabled={busy || !address}>
        {busy ? 'pending…' : hasAllowance ? 'create bounty' : 'approve & create'}
      </Button>
    </form>
  )
}

const inputClass =
  'w-full bg-transparent border border-border focus:border-accent outline-none px-2 py-1.5 text-sm'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-muted uppercase">{label}</label>
      {children}
      {error && <div className="text-status-disputed text-xs">{error}</div>}
    </div>
  )
}
