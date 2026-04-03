import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'
import { RegisterInput, LoginInput } from '@eldera/validators'

export const registerUser = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    throw createError('Email already in use', 409)
  }

  const passwordHash = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  return { user, token }
}

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    throw createError('Invalid email or password', 401)
  }

  const isMatch = await bcrypt.compare(data.password, user.passwordHash)

  if (!isMatch) {
    throw createError('Invalid email or password', 401)
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  const { passwordHash: _, ...userWithoutPassword } = user

  return { user: userWithoutPassword, token }
}

export const getMe = async (userId: string) => {
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

  if (!user) {
    throw createError('User not found', 404)
  }

  return user
}