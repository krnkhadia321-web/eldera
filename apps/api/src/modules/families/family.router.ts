import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import {
  createFamily,
  getFamily,
  addFamilyMember,
  getUserFamilies,
  removeFamilyMember,
} from './family.service'

export const familyRouter = Router()

familyRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const { name } = req.body
      const family = await createFamily(name, authReq.user!.id)
      res.status(201).json({ success: true, data: family })
    } catch (error) {
      next(error)
    }
  }
)

familyRouter.get(
  '/my',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const families = await getUserFamilies(authReq.user!.id)
      res.status(200).json({ success: true, data: families })
    } catch (error) {
      next(error)
    }
  }
)

familyRouter.get(
  '/:familyId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await getFamily(req.params.familyId)
      res.status(200).json({ success: true, data: family })
    } catch (error) {
      next(error)
    }
  }
)

familyRouter.post(
  '/:familyId/members',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, memberRole } = req.body
      const member = await addFamilyMember(
        req.params.familyId,
        userId,
        memberRole
      )
      res.status(201).json({ success: true, data: member })
    } catch (error) {
      next(error)
    }
  }
)

familyRouter.delete(
  '/:familyId/members/:userId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await removeFamilyMember(req.params.familyId, req.params.userId)
      res.status(200).json({ success: true, message: 'Member removed' })
    } catch (error) {
      next(error)
    }
  }
)