import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../../lib/utils'

interface Expense {
  id: string
  category: string
  amount: number
  description: string
  expenseDate: string
  payer: { fullName: string }
}

interface Summary {
  total: number
  byCategory: Record<string, number>
  count: number
}

const categories = ['medical', 'caregiver', 'medication', 'grocery', 'utility', 'other']

const categoryColors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  medical: 'red',
  caregiver: 'blue',
  medication: 'green',
  grocery: 'yellow',
  utility: 'gray',
  other: 'gray',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [elderId, setElderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    familyId: '', category: 'medical', amount: '', description: '', expenseDate: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elderRes = await api.get('/elders/me')
        const elder = elderRes.data.data
        setElderId(elder.id)
        const [expRes, sumRes] = await Promise.all([
          api.get(`/expenses/${elder.id}`),
          api.get(`/expenses/${elder.id}/summary`),
        ])
        setExpenses(expRes.data.data)
        setSummary(sumRes.data.data)
      } catch {
        console.error('Failed to load expenses')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!elderId) return
    try {
     const res = await api.post('/expenses', {
  elderId,
  familyId: form.familyId,
  category: form.category,
  amount: Number(form.amount),
  description: form.description,
  expenseDate: form.expenseDate,
})
setModalOpen(false)
toast.success('Expense added!')
// Refetch instead of optimistic update
const expRes = await api.get(`/expenses/${elderId}`)
setExpenses(expRes.data.data)
const sumRes = await api.get(`/expenses/${elderId}/summary`)
setSummary(sumRes.data.data)
    } catch {
      toast.error('Failed to add expense')
    }
  }

  const handleDelete = async (expId: string) => {
    try {
      await api.delete(`/expenses/${expId}`)
      setExpenses((prev) => prev.filter((e) => e.id !== expId))
      toast.success('Expense deleted')
    } catch {
      toast.error('Failed to delete expense')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Expenses" />
      <div className="p-6 space-y-6">
        {summary && (
          <Card>
            <h4 className="font-semibold text-gray-900 mb-3">Expense Summary</h4>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.total)}</p>
            <p className="text-sm text-gray-400 mb-4">{summary.count} transactions</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.byCategory).map(([cat, amt]) => (
                <div key={cat} className="flex items-center gap-1">
                  <Badge label={cat} variant={categoryColors[cat] || 'gray'} />
                  <span className="text-xs text-gray-600">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Transactions</h3>
          <Button size="sm" onClick={() => setModalOpen(true)}>+ Add Expense</Button>
        </div>

        <div className="space-y-3">
          {expenses.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-400 text-center py-4">No expenses recorded yet</p>
            </Card>
          ) : expenses.map((exp) => (
            <Card key={exp.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{exp.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {exp.payer.fullName} · {formatDate(exp.expenseDate)}
                  </p>
                  <div className="mt-1">
                    <Badge label={exp.category} variant={categoryColors[exp.category] || 'gray'} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-gray-900">{formatCurrency(exp.amount)}</p>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(exp.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
        <form onSubmit={handleAdd} className="space-y-3">
          <Input
            label="Family ID"
            placeholder="Your family ID"
            value={form.familyId}
            onChange={(e) => setForm(p => ({ ...p, familyId: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="500"
            value={form.amount}
            onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
            required
          />
          <Input
            label="Description"
            placeholder="e.g. Monthly checkup"
            value={form.description}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            required
          />
          <Input
            label="Date"
            type="date"
            value={form.expenseDate}
            onChange={(e) => setForm(p => ({ ...p, expenseDate: e.target.value }))}
            required
          />
          <Button type="submit" className="w-full">Add Expense</Button>
        </form>
      </Modal>
    </div>
  )
}