import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
  if (!user) throw createError('User not found', 404)
  return user
}

export const updateUser = async (
  userId: string,
  data: { fullName?: string; phone?: string; avatarUrl?: string }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      avatarUrl: true,
    },
  })
}

export const searchUsers = async (query: string) => {
  return prisma.user.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
      ],
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      avatarUrl: true,
    },
    take: 10,
  })
}