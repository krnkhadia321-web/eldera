import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'
import { BookingInput } from '@eldera/validators'
import { PLATFORM_FEE_PERCENT } from '@eldera/config'
import {
  sendCaregiverBookingAlert,
  sendBookingConfirmation,
} from '../notifications/email.service'

export const createBooking = async (
  familyId: string,
  data: BookingInput
) => {
  const caregiver = await prisma.caregiver.findUnique({
    where: { id: data.caregiverId },
    include: { user: { select: { fullName: true, email: true } } },
  })

  if (!caregiver) throw createError('Caregiver not found', 404)
  if (!caregiver.isAvailable) throw createError('Caregiver is not available', 400)

  const start = new Date(data.startTime)
  const end = new Date(data.endTime)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const totalAmount = hours * caregiver.hourlyRate
  const platformFee = (totalAmount * PLATFORM_FEE_PERCENT) / 100

  const booking = await prisma.booking.create({
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
      elder: { include: { user: { select: { fullName: true } } } },
    },
  })

  if (caregiver.user?.email) {
    await sendCaregiverBookingAlert(
      caregiver.user.email,
      caregiver.user.fullName,
      booking.elder.user.fullName,
      start.toLocaleString('en-IN'),
      end.toLocaleString('en-IN'),
      totalAmount,
      data.notes ?? ''
    )
  }

  return booking
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
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      caregiver: { include: { user: { select: { fullName: true } } } },
      elder: { include: { user: { select: { fullName: true } } } },
    },
  })

  if (status === 'confirmed' || status === 'cancelled') {
    const familyMembers = await prisma.familyMember.findMany({
      where: { familyId: booking.familyId },
      include: { user: { select: { email: true } } },
    })

    await Promise.all(
      familyMembers
        .filter((m) => m.user?.email)
        .map((m) =>
          sendBookingConfirmation(
            m.user!.email,
            booking.caregiver.user.fullName,
            booking.elder.user.fullName,
            booking.startTime.toLocaleString('en-IN'),
            booking.endTime.toLocaleString('en-IN'),
            Number(booking.totalAmount),
            status
          )
        )
    )
  }

  return booking
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