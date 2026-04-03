import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { medicationSchema } from '@eldera/validators'
import {
  addMedication,
  getMedications,
  logMedication,
  getMedLogs,
  deactivateMedication,
  getAdherenceStats,
} from './medication.service'

export const medicationRouter = Router()

medicationRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { elderId, ...rest } = req.body
      const data = medicationSchema.parse(rest)
      const medication = await addMedication(elderId, data)
      res.status(201).json({ success: true, data: medication })
    } catch (error) {
      next(error)
    }
  }
)

medicationRouter.post(
  '/log',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { medicationId, elderId, status, notes } = req.body
      const log = await logMedication(medicationId, elderId, status, notes)
      res.status(201).json({ success: true, data: log })
    } catch (error) {
      next(error)
    }
  }
)

medicationRouter.get(
  '/adherence/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await getAdherenceStats(req.params.elderId)
      res.status(200).json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }
)

medicationRouter.get(
  '/logs/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await getMedLogs(req.params.elderId)
      res.status(200).json({ success: true, data: logs })
    } catch (error) {
      next(error)
    }
  }
)

medicationRouter.get(
  '/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medications = await getMedications(req.params.elderId)
      res.status(200).json({ success: true, data: medications })
    } catch (error) {
      next(error)
    }
  }
)

medicationRouter.patch(
  '/:medicationId/deactivate',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medication = await deactivateMedication(req.params.medicationId)
      res.status(200).json({ success: true, data: medication })
    } catch (error) {
      next(error)
    }
  }
)