import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import { expenseSchema } from '@eldera/validators'
import {
  createExpense,
  getExpenses,
  getExpenseSummary,
  deleteExpense,
} from './expense.service'

export const expenseRouter = Router()

expenseRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const { elderId, familyId, ...rest } = req.body
      const data = expenseSchema.parse(rest)
      const expense = await createExpense(
        elderId,
        familyId,
        authReq.user!.id,
        data
      )
      res.status(201).json({ success: true, data: expense })
    } catch (error) {
      next(error)
    }
  }
)

expenseRouter.get(
  '/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, month, year } = req.query
      const expenses = await getExpenses(req.params.elderId, {
        category: category as string,
        month: month ? parseInt(month as string) : undefined,
        year: year ? parseInt(year as string) : undefined,
      })
      res.status(200).json({ success: true, data: expenses })
    } catch (error) {
      next(error)
    }
  }
)

expenseRouter.get(
  '/:elderId/summary',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await getExpenseSummary(req.params.elderId)
      res.status(200).json({ success: true, data: summary })
    } catch (error) {
      next(error)
    }
  }
)

expenseRouter.delete(
  '/:expenseId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteExpense(req.params.expenseId)
      res.status(200).json({ success: true, message: 'Expense deleted' })
    } catch (error) {
      next(error)
    }
  }
)