import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'

export const createFamily = async (name: string, createdBy: string) => {
  const family = await prisma.family.create({
    data: {
      name,
      createdBy,
      members: {
        create: {
          userId: createdBy,
          memberRole: 'primary',
          isPrimary: true,
        },
      },
    },
    include: { members: true },
  })
  return family
}

export const getFamily = async (familyId: string) => {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  })

  if (!family) throw createError('Family not found', 404)
  return family
}

export const addFamilyMember = async (
  familyId: string,
  userId: string,
  memberRole: 'primary' | 'secondary' = 'secondary'
) => {
  const existing = await prisma.familyMember.findFirst({
    where: { familyId, userId },
  })

  if (existing) throw createError('User is already a family member', 409)

  return prisma.familyMember.create({
    data: { familyId, userId, memberRole },
    include: { user: true },
  })
}

export const getUserFamilies = async (userId: string) => {
  return prisma.familyMember.findMany({
    where: { userId },
    include: {
      family: {
        include: { members: { include: { user: true } } },
      },
    },
  })
}

export const removeFamilyMember = async (
  familyId: string,
  userId: string
) => {
  return prisma.familyMember.deleteMany({
    where: { familyId, userId },
  })
}