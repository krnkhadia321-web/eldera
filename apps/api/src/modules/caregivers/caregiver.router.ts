import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.guard'
import {
  createCaregiverProfile,
  getCaregivers,
  getCaregiverById,
  updateCaregiverAvailability,
} from './caregiver.service'

export const caregiverRouter = Router()

caregiverRouter.post(
  '/profile',
  authenticate,
  requireRole('caregiver'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const profile = await createCaregiverProfile(authReq.user!.id, req.body)
      res.status(201).json({ success: true, data: profile })
    } catch (error) {
      next(error)
    }
  }
)

caregiverRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city, minRate, maxRate, isAvailable } = req.query
      const caregivers = await getCaregivers({
        city: city as string,
        minRate: minRate ? parseFloat(minRate as string) : undefined,
        maxRate: maxRate ? parseFloat(maxRate as string) : undefined,
        isAvailable: isAvailable ? isAvailable === 'true' : undefined,
      })
      res.status(200).json({ success: true, data: caregivers })
    } catch (error) {
      next(error)
    }
  }
)

caregiverRouter.get(
  '/:caregiverId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caregiver = await getCaregiverById(req.params.caregiverId)
      res.status(200).json({ success: true, data: caregiver })
    } catch (error) {
      next(error)
    }
  }
)

caregiverRouter.patch(
  '/availability',
  authenticate,
  requireRole('caregiver'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const { isAvailable } = req.body
      const caregiver = await updateCaregiverAvailability(
        authReq.user!.id,
        isAvailable
      )
      res.status(200).json({ success: true, data: caregiver })
    } catch (error) {
      next(error)
    }
  }
)