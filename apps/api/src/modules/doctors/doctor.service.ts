import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'

export const createDoctorProfile = async (
  userId: string,
  data: {
    specialty: string
    clinicName: string
    city: string
    consultationFee: number
    offersTelehealth?: boolean
  }
) => {
  const existing = await prisma.doctor.findUnique({ where: { userId } })
  if (existing) throw createError('Doctor profile already exists', 409)

  return prisma.doctor.create({
    data: { userId, ...data },
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
    },
  })
}

export const getDoctors = async (filters: {
  city?: string
  specialty?: string
  offersTelehealth?: boolean
}) => {
  return prisma.doctor.findMany({
    where: {
      ...(filters.city && { city: filters.city }),
      ...(filters.specialty && { specialty: filters.specialty }),
      ...(filters.offersTelehealth !== undefined && {
        offersTelehealth: filters.offersTelehealth,
      }),
    },
    include: {
      user: {
        select: { fullName: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { rating: 'desc' },
  })
}

export const getDoctorById = async (doctorId: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: { select: { fullName: true, email: true, phone: true, avatarUrl: true } },
    },
  })
  if (!doctor) throw createError('Doctor not found', 404)
  return doctor
}