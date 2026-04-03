import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'

export const createCaregiverProfile = async (
  userId: string,
  data: {
    bio?: string
    skills: string[]
    languages: string[]
    city: string
    hourlyRate: number
  }
) => {
  const existing = await prisma.caregiver.findUnique({ where: { userId } })
  if (existing) throw createError('Caregiver profile already exists', 409)

  return prisma.caregiver.create({
    data: { userId, ...data },
    include: { user: { select: { fullName: true, email: true, phone: true } } },
  })
}

export const getCaregivers = async (filters: {
  city?: string
  minRate?: number
  maxRate?: number
  isAvailable?: boolean
}) => {
  return prisma.caregiver.findMany({
    where: {
      isVerified: true,
      ...(filters.city && { city: filters.city }),
      ...(filters.isAvailable !== undefined && {
        isAvailable: filters.isAvailable,
      }),
      ...(filters.minRate !== undefined && {
        hourlyRate: { gte: filters.minRate },
      }),
      ...(filters.maxRate !== undefined && {
        hourlyRate: { lte: filters.maxRate },
      }),
    },
    include: {
      user: {
        select: { fullName: true, email: true, phone: true, avatarUrl: true },
      },
    },
    orderBy: { rating: 'desc' },
  })
}

export const getCaregiverById = async (caregiverId: string) => {
  const caregiver = await prisma.caregiver.findUnique({
    where: { id: caregiverId },
    include: {
      user: {
        select: { fullName: true, email: true, phone: true, avatarUrl: true },
      },
    },
  })
  if (!caregiver) throw createError('Caregiver not found', 404)
  return caregiver
}

export const updateCaregiverAvailability = async (
  userId: string,
  isAvailable: boolean
) => {
  return prisma.caregiver.update({
    where: { userId },
    data: { isAvailable },
  })
}

export const updateCaregiverRating = async (
  caregiverId: string,
  newRating: number
) => {
  return prisma.caregiver.update({
    where: { id: caregiverId },
    data: { rating: newRating },
  })
}