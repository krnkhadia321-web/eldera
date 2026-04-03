import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatDate } from '../../lib/utils'

interface Document {
  id: string
  title: string
  docType: string
  fileUrl: string
  uploadedAt: string
  uploader: { fullName: string; role: string }
}

const docTypes = ['medical_record', 'prescription', 'insurance', 'legal', 'identity', 'other']

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [elderId, setElderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', docType: 'medical_record', filePath: '' })

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const elderRes = await api.get('/elders/me')
        const elder = elderRes.data.data
        setElderId(elder.id)
        const res = await api.get(`/documents/${elder.id}`)
        setDocuments(res.data.data)
      } catch {
        console.error('Failed to load documents')
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!elderId) return
  try {
    await api.post('/documents', { elderId, ...form })
    setModalOpen(false)
    toast.success('Document uploaded!')
    // Refetch instead of optimistic update
    const res = await api.get(`/documents/${elderId}`)
    setDocuments(res.data.data)
  } catch {
    toast.error('Failed to upload document')
  }
}
  const handleDelete = async (docId: string) => {
    try {
      await api.delete(`/documents/${docId}`)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const getDocTypeVariant = (type: string) => {
    const map: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
      medical_record: 'blue',
      prescription: 'green',
      insurance: 'yellow',
      legal: 'red',
      identity: 'gray',
      other: 'gray',
    }
    return map[type] || 'gray'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Documents" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Medical Documents</h3>
          <Button size="sm" onClick={() => setModalOpen(true)}>+ Upload</Button>
        </div>

        {documents.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400 text-center py-8">No documents uploaded yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-xs text-gray-400">
                        Uploaded by {doc.uploader.fullName} · {formatDate(doc.uploadedAt)}
                      </p>
                      <div className="mt-1">
                        <Badge
                          label={doc.docType.replace('_', ' ')}
                          variant={getDocTypeVariant(doc.docType)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document">
        <form onSubmit={handleUpload} className="space-y-3">
          <Input
            label="Title"
            placeholder="e.g. Blood Test Report"
            value={form.title}
            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={form.docType}
              onChange={(e) => setForm(p => ({ ...p, docType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {docTypes.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <Input
            label="File URL / Path"
            placeholder="https://... or local path"
            value={form.filePath}
            onChange={(e) => setForm(p => ({ ...p, filePath: e.target.value }))}
            required
          />
          <Button type="submit" className="w-full">Upload Document</Button>
        </form>
      </Modal>
    </div>
  )
}