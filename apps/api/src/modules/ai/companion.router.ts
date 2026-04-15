import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import {
  sendCompanionMessage,
  getConversationHistory,
  getFlaggedConversations,
} from './companion.service'
import { analyzeTrends } from './trends.service'

export const aiRouter = Router()

aiRouter.get(
  '/trends/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const windowDays = req.query.days
        ? parseInt(req.query.days as string, 10)
        : 14
      const report = await analyzeTrends(req.params.elderId, windowDays)
      res.status(200).json({ success: true, data: report })
    } catch (error) {
      next(error)
    }
  }
)

aiRouter.post(
  '/chat',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { elderId, message } = req.body
      const result = await sendCompanionMessage(elderId, message)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }
)

aiRouter.get(
  '/history/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await getConversationHistory(req.params.elderId)
      res.status(200).json({ success: true, data: history })
    } catch (error) {
      next(error)
    }
  }
)

aiRouter.get(
  '/flagged/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flagged = await getFlaggedConversations(req.params.elderId)
      res.status(200).json({ success: true, data: flagged })
    } catch (error) {
      next(error)
    }
  }
)