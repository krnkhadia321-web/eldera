import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'
import { MedicationInput } from '@eldera/validators'

export const addMedication = async (
  elderId: string,
  data: MedicationInput
) => {
  return prisma.medication.create({
    data: {
      elderId,
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      reminderTime: data.reminderTime,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  })
}

export const getMedications = async (elderId: string) => {
  return prisma.medication.findMany({
    where: { elderId, isActive: true },
    orderBy: { startDate: 'desc' },
  })
}

export const logMedication = async (
  medicationId: string,
  elderId: string,
  status: 'taken' | 'missed' | 'skipped',
  notes?: string
) => {
  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
  })

  if (!medication) throw createError('Medication not found', 404)

  return prisma.medLog.create({
    data: { medicationId, elderId, status, notes },
  })
}

export const getMedLogs = async (elderId: string) => {
  return prisma.medLog.findMany({
    where: { elderId },
    include: { medication: true },
    orderBy: { loggedAt: 'desc' },
    take: 30,
  })
}

export const deactivateMedication = async (medicationId: string) => {
  return prisma.medication.update({
    where: { id: medicationId },
    data: { isActive: false },
  })
}

export const getAdherenceStats = async (elderId: string) => {
  const logs = await prisma.medLog.findMany({
    where: { elderId },
    orderBy: { loggedAt: 'desc' },
    take: 30,
  })

  const total = logs.length
  const taken = logs.filter((l: { status: string }) => l.status === 'taken').length
  const missed = logs.filter((l: { status: string }) => l.status === 'missed').length
  const skipped = logs.filter((l: { status: string }) => l.status === 'skipped').length
  return {
    total,
    taken,
    missed,
    skipped,
    adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
  }
}