import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import { getUserById, updateUser, searchUsers } from './users.service'

export const usersRouter = Router()

usersRouter.get(
  '/search',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query
      if (!q) {
        res.status(400).json({ success: false, message: 'Query required' })
        return
      }
      const users = await searchUsers(q as string)
      res.status(200).json({ success: true, data: users })
    } catch (error) {
      next(error)
    }
  }
)

usersRouter.get(
  '/:userId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getUserById(req.params.userId)
      res.status(200).json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  }
)

usersRouter.patch(
  '/:userId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fullName, phone, avatarUrl } = req.body
      const user = await updateUser(req.params.userId, {
        fullName,
        phone,
        avatarUrl,
      })
      res.status(200).json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  }
)