import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from './errorHandler'
import { UserRole } from '@eldera/types'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: UserRole
  }
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError('No token provided', 401))
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET!

    const decoded = jwt.verify(token, secret) as {
      id: string
      email: string
      role: UserRole
    }

    req.user = decoded
    return next()
  } catch {
    return next(createError('Invalid or expired token', 401))
  }
}