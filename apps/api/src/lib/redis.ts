import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get<T>(key)
    return data
  } catch {
    return null
  }
}

export const cacheSet = async (
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<void> => {
  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch {
    console.error('Redis set error')
  }
}

export const cacheDelete = async (key: string): Promise<void> => {
  try {
    await redis.del(key)
  } catch {
    console.error('Redis delete error')
  }
}

export const incrementRateLimit = async (
  ip: string,
  windowSeconds: number = 900
): Promise<number> => {
  try {
    const key = `rate:${ip}`
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }
    return count
  } catch {
    return 0
  }
}