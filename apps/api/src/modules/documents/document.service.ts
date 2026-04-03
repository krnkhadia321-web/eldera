import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'
import { DocType } from '@eldera/types'

export const uploadDocument = async (
  elderId: string,
  uploadedBy: string,
  title: string,
  docType: DocType,
  filePath: string
) => {
  return prisma.document.create({
    data: {
      elderId,
      uploadedBy,
      title,
      docType,
      fileUrl: filePath,
      fileKey: filePath,
    },
  })
}

export const getDocuments = async (elderId: string, docType?: DocType) => {
  return prisma.document.findMany({
    where: {
      elderId,
      ...(docType && { docType }),
    },
    include: {
      uploader: { select: { fullName: true, role: true } },
    },
    orderBy: { uploadedAt: 'desc' },
  })
}

export const deleteDocument = async (documentId: string) => {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  })
  if (!doc) throw createError('Document not found', 404)
  return prisma.document.delete({ where: { id: documentId } })
}