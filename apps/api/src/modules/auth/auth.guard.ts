import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { createError } from '../../middleware/errorHandler'

export const guardElder = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'elder') {
    return next(createError('Access restricted to elders only', 403))
  }
  return next()
}

export const guardFamily = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'family') {
    return next(createError('Access restricted to family members only', 403))
  }
  return next()
}

export const guardCaregiver = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'caregiver') {
    return next(createError('Access restricted to caregivers only', 403))
  }
  return next()
}

export const guardDoctor = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'doctor') {
    return next(createError('Access restricted to doctors only', 403))
  }
  return next()
}