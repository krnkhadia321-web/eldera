import cron from 'node-cron'
import { prisma } from '../lib/prisma'

export const startCleanupJobs = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('🧹 Running cleanup jobs...')

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        sentAt: { lt: thirtyDaysAgo },
      },
    })

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const deletedConversations = await prisma.aiConversation.deleteMany({
      where: {
        flagged: false,
        createdAt: { lt: ninetyDaysAgo },
      },
    })

    console.log(
      `✅ Cleanup done — deleted ${deletedNotifications.count} notifications, ${deletedConversations.count} conversations`
    )
  })

  console.log('✅ Cleanup cron started (daily at 2AM)')
}