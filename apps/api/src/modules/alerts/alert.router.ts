import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import {
  triggerSOS,
  getAlerts,
  getUnresolvedAlerts,
  resolveAlert,
} from './alert.service'

export const alertRouter = Router()

alertRouter.post(
  '/sos',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const { elderId } = req.body
      const result = await triggerSOS(elderId, authReq.user!.id)
      res.status(201).json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }
)

alertRouter.get(
  '/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await getAlerts(req.params.elderId)
      res.status(200).json({ success: true, data: alerts })
    } catch (error) {
      next(error)
    }
  }
)

alertRouter.get(
  '/:elderId/unresolved',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await getUnresolvedAlerts(req.params.elderId)
      res.status(200).json({ success: true, data: alerts })
    } catch (error) {
      next(error)
    }
  }
)

alertRouter.patch(
  '/:alertId/resolve',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alert = await resolveAlert(req.params.alertId)
      res.status(200).json({ success: true, data: alert })
    } catch (error) {
      next(error)
    }
  }
)