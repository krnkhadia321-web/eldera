import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.middleware'
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from './document.service'
import { DocType } from '@eldera/types'

export const documentRouter = Router()

documentRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest
      const { elderId, title, docType, filePath } = req.body
      const doc = await uploadDocument(
        elderId,
        authReq.user!.id,
        title,
        docType as DocType,
        filePath
      )
      res.status(201).json({ success: true, data: doc })
    } catch (error) {
      next(error)
    }
  }
)

documentRouter.get(
  '/:elderId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { docType } = req.query
      const docs = await getDocuments(
        req.params.elderId,
        docType as DocType | undefined
      )
      res.status(200).json({ success: true, data: docs })
    } catch (error) {
      next(error)
    }
  }
)

documentRouter.delete(
  '/:documentId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteDocument(req.params.documentId)
      res.status(200).json({ success: true, message: 'Document deleted' })
    } catch (error) {
      next(error)
    }
  }
)