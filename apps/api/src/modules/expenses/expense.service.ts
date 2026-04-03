import { prisma } from '../../lib/prisma'
import { ExpenseInput } from '@eldera/validators'

export const createExpense = async (
  elderId: string,
  familyId: string,
  paidBy: string,
  data: ExpenseInput
) => {
  return prisma.expense.create({
    data: {
      elderId,
      familyId,
      paidBy,
      category: data.category,
      amount: data.amount,
      description: data.description,
      expenseDate: new Date(data.expenseDate),
    },
  })
}

export const getExpenses = async (
  elderId: string,
  filters?: { category?: string; month?: number; year?: number }
) => {
  const where: Record<string, unknown> = { elderId }

  if (filters?.category) where.category = filters.category

  if (filters?.month && filters?.year) {
    const start = new Date(filters.year, filters.month - 1, 1)
    const end = new Date(filters.year, filters.month, 0)
    where.expenseDate = { gte: start, lte: end }
  }

  return prisma.expense.findMany({
    where,
    include: {
      payer: { select: { fullName: true, role: true } },
    },
    orderBy: { expenseDate: 'desc' },
  })
}

export const getExpenseSummary = async (elderId: string) => {
  const expenses = await prisma.expense.findMany({
    where: { elderId },
    orderBy: { expenseDate: 'desc' },
    take: 100,
  })

  const total = expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

  const byCategory = expenses.reduce(
    (acc: Record<string, number>, e: { category: string; amount: number }) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    },
    {}
  )

  return {
    total: Math.round(total * 100) / 100,
    byCategory,
    count: expenses.length,
  }
}

export const deleteExpense = async (expenseId: string) => {
  return prisma.expense.delete({ where: { id: expenseId } })
}