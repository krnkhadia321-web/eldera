import { prisma } from '../../lib/prisma'
import { HealthLogInput } from '@eldera/validators'
import { createLowMoodAlert } from '../alerts/alert.service'
import { MOOD_ALERT_THRESHOLD, MOOD_ALERT_CONSECUTIVE_DAYS } from '@eldera/config'

export const createHealthLog = async (
  elderId: string,
  data: HealthLogInput
) => {
  const log = await prisma.healthLog.create({
    data: {
      elderId,
      moodScore: data.moodScore,
      bpSystolic: data.bpSystolic,
      bpDiastolic: data.bpDiastolic,
      weightKg: data.weightKg,
      spo2: data.spo2,
      notes: data.notes,
    },
  })

  await checkLowMoodPattern(elderId)

  return log
}

export const getHealthLogs = async (elderId: string, take: number = 30) => {
  return prisma.healthLog.findMany({
    where: { elderId },
    orderBy: { loggedAt: 'desc' },
    take,
  })
}

export const getLatestHealthLog = async (elderId: string) => {
  return prisma.healthLog.findFirst({
    where: { elderId },
    orderBy: { loggedAt: 'desc' },
  })
}

export const getHealthSummary = async (elderId: string) => {
  const logs = await prisma.healthLog.findMany({
    where: { elderId },
    orderBy: { loggedAt: 'desc' },
    take: 7,
  })

  if (logs.length === 0) return null

  const avgMood = logs.reduce((sum: number, l: { moodScore: number }) => sum + l.moodScore, 0) / logs.length
  const latest = logs[0]

  return {
    avgMoodScore: Math.round(avgMood * 10) / 10,
    latestBP: latest.bpSystolic
      ? `${latest.bpSystolic}/${latest.bpDiastolic}`
      : null,
    latestWeight: latest.weightKg,
    latestSpo2: latest.spo2,
    logsCount: logs.length,
  }
}

const checkLowMoodPattern = async (elderId: string) => {
  const recentLogs = await prisma.healthLog.findMany({
    where: { elderId },
    orderBy: { loggedAt: 'desc' },
    take: MOOD_ALERT_CONSECUTIVE_DAYS,
  })

  if (recentLogs.length < MOOD_ALERT_CONSECUTIVE_DAYS) return

  const allLow = recentLogs.every(
    (l: { moodScore: number }) => l.moodScore <= MOOD_ALERT_THRESHOLD
  )

  if (allLow) {
    const avgMood =
      recentLogs.reduce((sum: number, l: { moodScore: number }) => sum + l.moodScore, 0) /
      recentLogs.length

    await createLowMoodAlert(
      elderId,
      Math.round(avgMood),
      MOOD_ALERT_CONSECUTIVE_DAYS
    )
  }
}