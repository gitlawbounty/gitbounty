import { NextResponse } from 'next/server'
import { fetchRepos } from '@/lib/scraper/repos-list'
import { commonHeaders } from '@/lib/api/serialize'

export const revalidate = 300

export async function GET() {
  const repos = await fetchRepos()
  return NextResponse.json(
    {
      repos,
      count: repos.length,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        ...commonHeaders('rpc'),
        'Cache-Control': 's-maxage=300, stale-while-revalidate=900',
      },
    },
  )
}
