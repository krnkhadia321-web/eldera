import cron from 'node-cron'
import { prisma } from '../../lib/prisma'
import { analyzeTrends } from './trends.service'
import { sendHealthTrendAlert } from '../notifications/email.service'

export const runTrendAlerts = async () => {
  console.log('🧠 Running daily trend alerts...')

  const elders = await prisma.elderProfile.findMany({
    include: { user: { select: { fullName: true } } },
  })

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  for (const elder of elders) {
    try {
      const report = await analyzeTrends(elder.id, 14)
      if (report.concerns.length === 0) continue

      const recentTrendAlert = await prisma.alert.findFirst({
        where: {
          elderId: elder.id,
          alertType: 'health_trend',
          triggeredAt: { gte: since },
        },
      })
      if (recentTrendAlert) {
        console.log(
          `⏭ Skipping ${elder.user.fullName} — already alerted in last 24h`
        )
        continue
      }

      const hasCritical = report.concerns.some((c) => c.severity === 'critical')
      const severity = hasCritical ? 'critical' : 'high'
      const summary = report.concerns
        .map((c) => `${c.label}: ${c.message}`)
        .join(' | ')

      await prisma.alert.create({
        data: {
          elderId: elder.id,
          triggeredBy: elder.userId,
          alertType: 'health_trend',
          severity,
          message: `Health trend alert (${report.concerns.length} concern${
            report.concerns.length === 1 ? '' : 's'
          }): ${summary}`,
        },
      })
      console.log(
        `🚨 Trend alert created for ${elder.user.fullName} (${severity})`
      )

      if (hasCritical) {
        const familyMembers = await prisma.familyMember.findMany({
          where: {
            family: {
              members: {
                some: { user: { elderProfile: { id: elder.id } } },
              },
            },
          },
          include: { user: { select: { email: true } } },
        })

        const uniqueEmails = Array.from(
          new Set(
            familyMembers
              .map((m) => m.user?.email)
              .filter((e): e is string => !!e)
          )
        )

        await Promise.all(
          uniqueEmails.map((email) =>
            sendHealthTrendAlert(email, elder.user.fullName, report.concerns)
          )
        )
      }
    } catch (err) {
      console.error(`❌ Trend alert failed for elder ${elder.id}:`, err)
    }
  }
}

export const startTrendAlerts = () => {
  cron.schedule('0 9 * * *', runTrendAlerts)
  console.log('✅ Trend alerts cron started (daily at 9AM)')
}
