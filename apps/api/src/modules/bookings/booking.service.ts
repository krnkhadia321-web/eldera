import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'
import { BookingInput } from '@eldera/validators'
import { PLATFORM_FEE_PERCENT } from '@eldera/config'

export const createBooking = async (
  familyId: string,
  data: BookingInput
) => {
  const caregiver = await prisma.caregiver.findUnique({
    where: { id: data.caregiverId },
  })

  if (!caregiver) throw createError('Caregiver not found', 404)
  if (!caregiver.isAvailable) throw createError('Caregiver is not available', 400)

  const start = new Date(data.startTime)
  const end = new Date(data.endTime)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const totalAmount = hours * caregiver.hourlyRate
  const platformFee = (totalAmount * PLATFORM_FEE_PERCENT) / 100

  return prisma.booking.create({
    data: {
      elderId: data.elderId,
      caregiverId: data.caregiverId,
      familyId,
      startTime: start,
      endTime: end,
      totalAmount,
      platformFee,
      notes: data.notes,
    },
    include: {
      caregiver: {
        include: { user: { select: { fullName: true, phone: true } } },
      },
    },
  })
}

export const getBookings = async (filters: {
  elderId?: string
  caregiverId?: string
  familyId?: string
}) => {
  return prisma.booking.findMany({
    where: {
      ...(filters.elderId && { elderId: filters.elderId }),
      ...(filters.caregiverId && { caregiverId: filters.caregiverId }),
      ...(filters.familyId && { familyId: filters.familyId }),
    },
    include: {
      caregiver: {
        include: { user: { select: { fullName: true, avatarUrl: true } } },
      },
      elder: {
        include: { user: { select: { fullName: true } } },
      },
    },
    orderBy: { startTime: 'desc' },
  })
}

export const updateBookingStatus = async (
  bookingId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  })
}

export const getBookingById = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      caregiver: {
        include: { user: { select: { fullName: true, phone: true } } },
      },
      elder: {
        include: { user: { select: { fullName: true } } },
      },
      family: true,
    },
  })
  if (!booking) throw createError('Booking not found', 404)
  return booking
}