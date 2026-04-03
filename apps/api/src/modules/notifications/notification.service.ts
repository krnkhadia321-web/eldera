import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'

export const getNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { sentAt: 'desc' },
    take: 50,
  })
}

export const markAsRead = async (notificationId: string) => {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })
}

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}

export const createNotification = async (
  userId: string,
  title: string,
  body: string,
  channel: 'in_app' | 'email' | 'sms' | 'whatsapp' = 'in_app'
) => {
  return prisma.notification.create({
    data: { userId, title, body, channel },
  })
}

export const notificationRouter = Router()

notificationRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const notifications = await getNotifications(authReq.user!.id)
      res.status(200).json({ success: true, data: notifications })
    } catch (error) {
      next(error)
    }
  }
)

notificationRouter.patch(
  '/:notificationId/read',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await markAsRead(req.params.notificationId)
      res.status(200).json({ success: true, data: notification })
    } catch (error) {
      next(error)
    }
  }
)

notificationRouter.patch(
  '/read-all',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      await markAllAsRead(authReq.user!.id)
      res.status(200).json({ success: true, message: 'All notifications marked as read' })
    } catch (error) {
      next(error)
    }
  }
)