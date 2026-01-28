// Simple in-memory rate limiter (use Redis/Upstash in production)

interface RateLimitStore {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitStore>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const record = store.get(identifier)

  // Clean up expired records periodically
  if (store.size > 10000) {
    for (const [key, value] of store.entries()) {
      if (value.resetAt < now) {
        store.delete(key)
      }
    }
  }

  if (!record || record.resetAt < now) {
    // Create new record
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return { success: false, remaining: 0, resetAt: record.resetAt }
  }

  // Increment count
  record.count++
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt }
}

// Preset rate limiters
export const authRateLimit = (ip: string) => rateLimit(ip, 5, 15 * 60 * 1000) // 5 requests per 15 minutes
export const apiRateLimit = (ip: string) => rateLimit(ip, 100, 60 * 1000) // 100 requests per minute
export const strictRateLimit = (ip: string) => rateLimit(ip, 3, 60 * 1000) // 3 requests per minute

export function getClientIdentifier(req: Request): string {
  // Try to get IP from headers
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

export function createRateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toString(),
        'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
      },
    }
  )
}
