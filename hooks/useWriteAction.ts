'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'

export function useWriteAction() {
  const queryClient = useQueryClient()
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      toast.success('tx confirmed')
      queryClient.invalidateQueries({ queryKey: ['bounties'] })
      queryClient.invalidateQueries({ queryKey: ['bounty'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
    if (isError) toast.error('tx reverted')
  }, [isSuccess, isError, queryClient])

  useEffect(() => {
    if (error) toast.error(error.message.slice(0, 100))
  }, [error])

  return {
    writeContract,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    reset,
  }
}
