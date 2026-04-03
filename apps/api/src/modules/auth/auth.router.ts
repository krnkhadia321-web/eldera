import { Router, Request, Response, NextFunction } from 'express'
import { registerUser, loginUser, getMe } from './auth.service'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import { registerSchema, loginSchema } from '@eldera/validators'

export const authRouter = Router()

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body)
    const result = await registerUser(data)
    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body)
    const result = await loginUser(data)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await getMe(req.user!.id)
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
})