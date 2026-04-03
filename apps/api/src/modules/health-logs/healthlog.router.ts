import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { healthLogSchema } from '@eldera/validators'
import {
  createHealthLog,
  getHealthLogs,
  getLatestHealthLog,
  getHealthSummary,
} from './healthlog.service'

export const healthLogRouter = Router()

healthLogRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { elderId, ...rest } = req.body
      const data = healthLogSchema.parse(rest)
      const log = await createHealthLog(elderId, data)
      res.status(201).json({ success: true, data: log })
    } catch (error) {
      next(error)
    }
  }
)

healthLogRouter.get(
  '/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const take = req.query.take ? parseInt(req.query.take as string) : 30
      const logs = await getHealthLogs(req.params.elderId, take)
      res.status(200).json({ success: true, data: logs })
    } catch (error) {
      next(error)
    }
  }
)

healthLogRouter.get(
  '/:elderId/latest',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await getLatestHealthLog(req.params.elderId)
      res.status(200).json({ success: true, data: log })
    } catch (error) {
      next(error)
    }
  }
)

healthLogRouter.get(
  '/:elderId/summary',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await getHealthSummary(req.params.elderId)
      res.status(200).json({ success: true, data: summary })
    } catch (error) {
      next(error)
    }
  }
)