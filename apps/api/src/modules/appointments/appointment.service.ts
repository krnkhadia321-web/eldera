import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'
import { AppointmentInput } from '@eldera/validators'

export const createAppointment = async (
  familyId: string,
  data: AppointmentInput
) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: data.doctorId },
  })
  if (!doctor) throw createError('Doctor not found', 404)

  const appointment = await prisma.appointment.create({
    data: {
      elderId: data.elderId,
      doctorId: data.doctorId,
      familyId,
      scheduledAt: new Date(data.scheduledAt),
      type: data.type,
      notes: data.notes,
    },
    include: {
      doctor: {
        include: { user: { select: { fullName: true, phone: true } } },
      },
      elder: {
        include: { user: { select: { fullName: true } } },
      },
    },
  })

  return appointment
}

export const getAppointments = async (filters: {
  elderId?: string
  doctorId?: string
  familyId?: string
}) => {
  return prisma.appointment.findMany({
    where: {
      ...(filters.elderId && { elderId: filters.elderId }),
      ...(filters.doctorId && { doctorId: filters.doctorId }),
      ...(filters.familyId && { familyId: filters.familyId }),
    },
    include: {
      doctor: {
        include: { user: { select: { fullName: true, avatarUrl: true } } },
      },
      elder: {
        include: { user: { select: { fullName: true } } },
      },
    },
    orderBy: { scheduledAt: 'desc' },
  })
}

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: 'completed' | 'cancelled' | 'no_show'
) => {
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  })
}

export const addVideoRoomUrl = async (
  appointmentId: string,
  videoRoomUrl: string
) => {
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { videoRoomUrl },
  })
}

export const getUpcomingAppointments = async (elderId: string) => {
  return prisma.appointment.findMany({
    where: {
      elderId,
      scheduledAt: { gte: new Date() },
      status: 'scheduled',
    },
    include: {
      doctor: {
        include: { user: { select: { fullName: true, avatarUrl: true } } },
      },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 5,
  })
}