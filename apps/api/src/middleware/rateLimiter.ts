import { Request, Response, NextFunction } from 'express'

const requests = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 100

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()

  const record = requests.get(ip)

  if (!record || now > record.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return next()
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    })
  }

  record.count++
  return next()
}