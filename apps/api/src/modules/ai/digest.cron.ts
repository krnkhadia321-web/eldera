import cron from 'node-cron'
import { prisma } from '../../lib/prisma'
import { chatWithGroq } from '../../lib/groq'

export const startWeeklyDigest = () => {
  cron.schedule('0 8 * * 0', async () => {
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

        const digest = await chatWithGroq(
          [{ role: 'user', content: prompt }]
        )

        console.log(`✅ Digest generated for ${elder.user.fullName}:`, digest)

      } catch (err) {
        console.error(`❌ Failed digest for elder ${elder.id}:`, err)
      }
    }
  })

  console.log('✅ Weekly digest cron started (Sundays at 8AM)')
}