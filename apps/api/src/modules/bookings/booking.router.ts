import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import { bookingSchema } from '@eldera/validators'
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  getBookingById,
} from './booking.service'

export const bookingRouter = Router()

bookingRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const { familyId, ...rest } = req.body
      const data = bookingSchema.parse(rest)
      const booking = await createBooking(familyId, data)
      res.status(201).json({ success: true, data: booking })
    } catch (error) {
      next(error)
    }
  }
)

bookingRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { elderId, caregiverId, familyId } = req.query
      const bookings = await getBookings({
        elderId: elderId as string,
        caregiverId: caregiverId as string,
        familyId: familyId as string,
      })
      res.status(200).json({ success: true, data: bookings })
    } catch (error) {
      next(error)
    }
  }
)

bookingRouter.get(
  '/:bookingId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const booking = await getBookingById(req.params.bookingId)
      res.status(200).json({ success: true, data: booking })
    } catch (error) {
      next(error)
    }
  }
)

bookingRouter.patch(
  '/:bookingId/status',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body
      const booking = await updateBookingStatus(req.params.bookingId, status)
      res.status(200).json({ success: true, data: booking })
    } catch (error) {
      next(error)
    }
  }
)