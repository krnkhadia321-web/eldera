import cron from 'node-cron'
import { prisma } from '../../lib/prisma'
import { chatWithGroq } from '../../lib/groq'
import { sendWeeklyDigest } from '../notifications/email.service'

export const runWeeklyDigest = async () => {
  console.log('📧 Running weekly health digest...')

  const elders = await prisma.elderProfile.findMany({
    include: {
      user: true,
      healthLogs: {
        orderBy: { loggedAt: 'desc' },
        take: 7,
      },
      medications: { where: { isActive: true } },
      alerts: {
        where: { resolved: false },
        orderBy: { triggeredAt: 'desc' },
        take: 5,
      },
    },
  })

  for (const elder of elders) {
    try {
      const healthData = {
        name: elder.user.fullName,
        recentMoods: elder.healthLogs.map((l: { moodScore: number }) => l.moodScore),
        activeMedications: elder.medications.map((m: { name: string }) => m.name),
        unresolvedAlerts: elder.alerts.map((a: { message: string }) => a.message),
      }

      const prompt = `Generate a brief weekly health summary for a family member about their elderly parent named ${healthData.name}.
Health data this week:
- Mood scores (1-10): ${healthData.recentMoods.join(', ') || 'No data'}
- Active medications: ${healthData.activeMedications.join(', ') || 'None'}
- Unresolved alerts: ${healthData.unresolvedAlerts.join(', ') || 'None'}

Write a warm, concise 3-4 sentence summary in English. Be caring and informative.`

      const digest = await chatWithGroq([{ role: 'user', content: prompt }])

      console.log(`✅ Digest generated for ${elder.user.fullName}:`, digest)

      const moods = elder.healthLogs.map((l: { moodScore: number }) => l.moodScore)
      const avgMood = moods.length
        ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10
        : 0

      const latestLog = elder.healthLogs[0] as
        | { bpSystolic: number | null; bpDiastolic: number | null }
        | undefined
      const latestBP =
        latestLog?.bpSystolic && latestLog?.bpDiastolic
          ? `${latestLog.bpSystolic}/${latestLog.bpDiastolic}`
          : null

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const medLogs = await prisma.medLog.findMany({
        where: { elderId: elder.id, loggedAt: { gte: sevenDaysAgo } },
      })
      const taken = medLogs.filter((l) => l.status === 'taken').length
      const adherence = medLogs.length
        ? Math.round((taken / medLogs.length) * 100)
        : 0

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
          sendWeeklyDigest(
            email,
            elder.user.fullName,
            digest,
            avgMood,
            latestBP,
            adherence
          )
        )
      )
    } catch (err) {
      console.error(`❌ Failed digest for elder ${elder.id}:`, err)
    }
  }
}

export const startWeeklyDigest = () => {
  cron.schedule('0 8 * * 0', runWeeklyDigest)
  console.log('✅ Weekly digest cron started (Sundays at 8AM)')
}
