import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { createError } from './errorHandler'
import { UserRole } from '@eldera/types'

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Unauthorized', 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Forbidden: insufficient permissions', 403))
    }

    return next()
  }
}