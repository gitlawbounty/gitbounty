import { formatUnits } from 'viem'

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const raw = formatUnits(amount, decimals)
  const [whole, frac] = raw.split('.')
  const wholeFormatted = Number(whole).toLocaleString('en-US')
  if (!frac || /^0+$/.test(frac)) return wholeFormatted
  const trimmedFrac = frac.replace(/0+$/, '')
  return `${wholeFormatted}.${trimmedFrac}`
}

export function formatTokenAmountWithSymbol(amount: bigint, decimals: number, symbol: string): string {
  return `${formatTokenAmount(amount, decimals)} ${symbol}`
}
