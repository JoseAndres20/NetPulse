import { NextRequest } from 'next/server'
import { AppError } from './errors'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 100

export const rateLimiter = {
  check(key: string): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS })
      return true
    }

    if (entry.count >= MAX_REQUESTS) {
      return false
    }

    entry.count++
    return true
  },

  getRemaining(key: string): number {
    const entry = rateLimitStore.get(key)
    if (!entry) return MAX_REQUESTS
    return Math.max(0, MAX_REQUESTS - entry.count)
  }
}

export function rateLimitMiddleware(req: NextRequest): void {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const key = `ratelimit:${ip}`

  if (!rateLimiter.check(key)) {
    throw AppError.rateLimit('Too many requests. Please try again later.')
  }
}