// Twitter (X) API v2 client wrapper.
//
// Auth requires OAuth 1.0a app credentials (4 keys). Get them from
// developer.x.com → create app → enable Read+Write permissions.
//
// When TWITTER_DRY_RUN=true, no actual API call is made — the would-be tweet
// is logged to stdout instead. Used for local development.

import { TwitterApi } from 'twitter-api-v2'

const DRY_RUN = process.env.TWITTER_DRY_RUN === 'true'

function getClient(): TwitterApi {
  const appKey = process.env.TWITTER_API_KEY
  const appSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error(
      'twitter credentials missing — set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET',
    )
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret })
}

export interface PostResult {
  posted: boolean
  tweetId?: string
  dryRun: boolean
  error?: string
}

/**
 * Post a tweet. In dry-run mode, logs to stdout and returns posted=false.
 * @param text Tweet body (≤280 chars; will be truncated to 277 + "…" if longer)
 */
export async function postTweet(text: string): Promise<PostResult> {
  const trimmed = text.length > 280 ? text.slice(0, 277) + '…' : text

  if (DRY_RUN) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[twitter dry-run] would post:')
    console.log(trimmed)
    console.log(`[${trimmed.length}/280 chars]`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return { posted: false, dryRun: true }
  }

  try {
    const client = getClient()
    const { data } = await client.v2.tweet(trimmed)
    return { posted: true, tweetId: data.id, dryRun: false }
  } catch (err) {
    return {
      posted: false,
      dryRun: false,
      error: String(err).slice(0, 200),
    }
  }
}

/** Post a thread (array of tweets, each replies to the previous). */
export async function postThread(tweets: string[]): Promise<PostResult[]> {
  if (DRY_RUN) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`[twitter dry-run] would post thread (${tweets.length} tweets):`)
    tweets.forEach((t, i) => {
      console.log(`\n--- tweet ${i + 1}/${tweets.length} [${t.length}/280] ---`)
      console.log(t)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return tweets.map(() => ({ posted: false, dryRun: true }))
  }

  const client = getClient()
  const results: PostResult[] = []
  let replyTo: string | undefined

  for (const t of tweets) {
    const trimmed = t.length > 280 ? t.slice(0, 277) + '…' : t
    try {
      const { data } = await client.v2.tweet(
        trimmed,
        replyTo ? { reply: { in_reply_to_tweet_id: replyTo } } : undefined,
      )
      results.push({ posted: true, tweetId: data.id, dryRun: false })
      replyTo = data.id
    } catch (err) {
      results.push({
        posted: false,
        dryRun: false,
        error: String(err).slice(0, 200),
      })
      break // bail on first error rather than orphan a half-thread
    }
  }
  return results
}
