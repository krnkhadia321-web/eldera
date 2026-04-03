import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import { appointmentSchema } from '@eldera/validators'
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  addVideoRoomUrl,
  getUpcomingAppointments,
} from './appointment.service'

export const appointmentRouter = Router()

appointmentRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const { familyId, ...rest } = req.body
      const data = appointmentSchema.parse(rest)
      const appointment = await createAppointment(familyId, data)
      res.status(201).json({ success: true, data: appointment })
    } catch (error) {
      next(error)
    }
  }
)

appointmentRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { elderId, doctorId, familyId } = req.query
      const appointments = await getAppointments({
        elderId: elderId as string,
        doctorId: doctorId as string,
        familyId: familyId as string,
      })
      res.status(200).json({ success: true, data: appointments })
    } catch (error) {
      next(error)
    }
  }
)

appointmentRouter.get(
  '/upcoming/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointments = await getUpcomingAppointments(req.params.elderId)
      res.status(200).json({ success: true, data: appointments })
    } catch (error) {
      next(error)
    }
  }
)

appointmentRouter.patch(
  '/:appointmentId/status',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body
      const appointment = await updateAppointmentStatus(
        req.params.appointmentId,
        status
      )
      res.status(200).json({ success: true, data: appointment })
    } catch (error) {
      next(error)
    }
  }
)

appointmentRouter.patch(
  '/:appointmentId/video-room',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoRoomUrl } = req.body
      const appointment = await addVideoRoomUrl(
        req.params.appointmentId,
        videoRoomUrl
      )
      res.status(200).json({ success: true, data: appointment })
    } catch (error) {
      next(error)
    }
  }
)