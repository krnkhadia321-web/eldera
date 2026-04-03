import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'
import { ElderProfileInput } from '@eldera/validators'

export const createElderProfile = async (
  userId: string,
  data: ElderProfileInput
) => {
  const existing = await prisma.elderProfile.findUnique({
    where: { userId },
  })

  if (existing) {
    throw createError('Elder profile already exists', 409)
  }

  const profile = await prisma.elderProfile.create({
    data: {
      userId,
      dateOfBirth: new Date(data.dateOfBirth),
      bloodGroup: data.bloodGroup,
      address: data.address,
      city: data.city,
      emergencyContact: data.emergencyContact,
      medicalConditions: data.medicalConditions,
      allergies: data.allergies,
    },
  })

  return profile
}

export const getElderProfile = async (elderId: string) => {
  const profile = await prisma.elderProfile.findUnique({
    where: { id: elderId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
  })

  if (!profile) {
    throw createError('Elder profile not found', 404)
  }

  return profile
}

export const getElderByUserId = async (userId: string) => {
  const profile = await prisma.elderProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
      medications: { where: { isActive: true } },
    },
  })

  if (!profile) {
    throw createError('Elder profile not found', 404)
  }

  return profile
}

export const updateElderProfile = async (
  elderId: string,
  data: Partial<ElderProfileInput>
) => {
  const profile = await prisma.elderProfile.update({
    where: { id: elderId },
    data: {
      ...(data.bloodGroup && { bloodGroup: data.bloodGroup }),
      ...(data.address && { address: data.address }),
      ...(data.city && { city: data.city }),
      ...(data.emergencyContact && { emergencyContact: data.emergencyContact }),
      ...(data.medicalConditions && { medicalConditions: data.medicalConditions }),
      ...(data.allergies && { allergies: data.allergies }),
    },
  })

  return profile
}

export const getFamilyElders = async (familyId: string) => {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        include: {
          user: {
            include: {
              elderProfile: true,
            },
          },
        },
      },
    },
  })

  if (!family) {
    throw createError('Family not found', 404)
  }

  return family.members
    .map((m: { user: { elderProfile: unknown } }) => m.user.elderProfile)
    .filter(Boolean)
}