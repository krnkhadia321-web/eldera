import { Router, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.guard'
import { elderProfileSchema } from '@eldera/validators'
import {
  createElderProfile,
  getElderProfile,
  getElderByUserId,
  updateElderProfile,
  getFamilyElders,
  getElderByUserIdPublic
} from './elder.service'

export const elderRouter = Router()

elderRouter.post(
  '/profile',
  authenticate,
  requireRole('elder'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = elderProfileSchema.parse(req.body)
      const profile = await createElderProfile(req.user!.id, data)
      res.status(201).json({ success: true, data: profile })
    } catch (error) {
      next(error)
    }
  }
)

elderRouter.get(
  '/me',
  authenticate,
  requireRole('elder'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await getElderByUserId(req.user!.id)
      res.status(200).json({ success: true, data: profile })
    } catch (error) {
      next(error)
    }
  }
)

elderRouter.get(
  '/:elderId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await getElderProfile(req.params.elderId)
      res.status(200).json({ success: true, data: profile })
    } catch (error) {
      next(error)
    }
  }
)

elderRouter.put(
  '/:elderId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = elderProfileSchema.partial().parse(req.body)
      const profile = await updateElderProfile(req.params.elderId, data)
      res.status(200).json({ success: true, data: profile })
    } catch (error) {
      next(error)
    }
  }
)

elderRouter.get(
  '/family/:familyId',
  authenticate,
  requireRole('family', 'admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const elders = await getFamilyElders(req.params.familyId)
      res.status(200).json({ success: true, data: elders })
    } catch (error) {
      next(error)
    }
  }
)

elderRouter.get(
  '/by-user/:userId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await getElderByUserIdPublic(req.params.userId)
      res.status(200).json({ success: true, data: profile })
    } catch (error) {
      next(error)
    }
  }
)