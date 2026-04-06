import { Request, Response, NextFunction } from 'express'
import { incrementRateLimit } from '../lib/redis'

const MAX_REQUESTS = 100

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'

  const count = await incrementRateLimit(ip, 900)

  if (count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    })
  }

  return next()
}