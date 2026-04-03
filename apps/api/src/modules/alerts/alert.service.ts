import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'
import { ALERT_SEVERITY, ALERT_TYPE } from '@eldera/config'

export const triggerSOS = async (elderId: string, triggeredBy: string) => {
  const elder = await prisma.elderProfile.findUnique({
    where: { id: elderId },
    include: { user: true },
  })

  if (!elder) throw createError('Elder not found', 404)

  const alert = await prisma.alert.create({
    data: {
      elderId,
      triggeredBy,
      alertType: ALERT_TYPE.SOS,
      severity: ALERT_SEVERITY.CRITICAL,
      message: `SOS alert triggered by ${elder.user.fullName}`,
    },
  })

  return { alert, elder }
}

export const getAlerts = async (elderId: string) => {
  return prisma.alert.findMany({
    where: { elderId },
    orderBy: { triggeredAt: 'desc' },
    take: 50,
  })
}

export const getUnresolvedAlerts = async (elderId: string) => {
  return prisma.alert.findMany({
    where: { elderId, resolved: false },
    orderBy: { triggeredAt: 'desc' },
  })
}

export const resolveAlert = async (alertId: string) => {
  const alert = await prisma.alert.update({
    where: { id: alertId },
    data: { resolved: true },
  })
  return alert
}

export const createMissedMedAlert = async (
  elderId: string,
  medicationName: string
) => {
  return prisma.alert.create({
    data: {
      elderId,
      triggeredBy: elderId,
      alertType: ALERT_TYPE.MISSED_MEDICATION,
      severity: ALERT_SEVERITY.MEDIUM,
      message: `Missed medication: ${medicationName}`,
    },
  })
}

export const createLowMoodAlert = async (
  elderId: string,
  moodScore: number,
  consecutiveDays: number
) => {
  return prisma.alert.create({
    data: {
      elderId,
      triggeredBy: elderId,
      alertType: ALERT_TYPE.LOW_MOOD,
      severity: ALERT_SEVERITY.HIGH,
      message: `Low mood score (${moodScore}/10) for ${consecutiveDays} consecutive days`,
    },
  })
}