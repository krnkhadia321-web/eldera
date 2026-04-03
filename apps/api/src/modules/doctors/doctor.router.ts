import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.guard'
import {
  createDoctorProfile,
  getDoctors,
  getDoctorById,
} from './doctor.service'

export const doctorRouter = Router()

doctorRouter.post(
  '/profile',
  authenticate,
  requireRole('doctor'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const profile = await createDoctorProfile(authReq.user!.id, req.body)
      res.status(201).json({ success: true, data: profile })
    } catch (error) {
      next(error)
    }
  }
)

doctorRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city, specialty, offersTelehealth } = req.query
      const doctors = await getDoctors({
        city: city as string,
        specialty: specialty as string,
        offersTelehealth: offersTelehealth
          ? offersTelehealth === 'true'
          : undefined,
      })
      res.status(200).json({ success: true, data: doctors })
    } catch (error) {
      next(error)
    }
  }
)

doctorRouter.get(
  '/:doctorId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctor = await getDoctorById(req.params.doctorId)
      res.status(200).json({ success: true, data: doctor })
    } catch (error) {
      next(error)
    }
  }
)