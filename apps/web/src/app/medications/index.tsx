import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatTime } from '../../lib/utils'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  reminderTime: string
  isActive: boolean
}

export default function MedicationsPage() {
  const { user } = useAuthStore()
  const [medications, setMedications] = useState<Medication[]>([])
  const [elderId, setElderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [adherence, setAdherence] = useState<{
    adherenceRate: number; taken: number; missed: number; total: number
  } | null>(null)
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: '', reminderTime: '', startDate: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elderRes = await api.get('/elders/me')
        const elder = elderRes.data.data
        setElderId(elder.id)
        const [medRes, adherenceRes] = await Promise.all([
          api.get(`/medications/${elder.id}`),
          api.get(`/medications/adherence/${elder.id}`),
        ])
        setMedications(medRes.data.data)
        setAdherence(adherenceRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/medications', { elderId, ...form })
      setMedications((prev) => [...prev, res.data.data])
      setModalOpen(false)
      setForm({ name: '', dosage: '', frequency: '', reminderTime: '', startDate: '' })
      toast.success('Medication added!')
    } catch {
      toast.error('Failed to add medication')
    }
  }

  const handleLog = async (status: 'taken' | 'missed' | 'skipped') => {
    if (!selectedMed || !elderId) return
    try {
      await api.post('/medications/log', {
        medicationId: selectedMed.id,
        elderId,
        status,
      })
      toast.success(`Logged as ${status}`)
      setLogModalOpen(false)
      setSelectedMed(null)
    } catch {
      toast.error('Failed to log medication')
    }
  }

  const handleDeactivate = async (medId: string) => {
    try {
      await api.patch(`/medications/${medId}/deactivate`)
      setMedications((prev) => prev.filter((m) => m.id !== medId))
      toast.success('Medication removed')
    } catch {
      toast.error('Failed to remove medication')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Medications" />
      <div className="p-6 space-y-6">

        {adherence && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-3xl font-bold text-blue-600">{adherence.adherenceRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Adherence Rate</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">{adherence.taken}</p>
              <p className="text-xs text-gray-500 mt-1">Taken</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-red-600">{adherence.missed}</p>
              <p className="text-xs text-gray-500 mt-1">Missed</p>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Active Medications</h3>
          <Button onClick={() => setModalOpen(true)} size="sm">+ Add Medication</Button>
        </div>

        <div className="space-y-3">
          {medications.length === 0 ? (
            <Card><p className="text-sm text-gray-400 text-center py-4">No medications added yet</p></Card>
          ) : medications.map((med) => (
            <Card key={med.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{med.name}</p>
                  <p className="text-sm text-gray-500">{med.dosage} · {med.frequency}</p>
                  <p className="text-xs text-gray-400 mt-1">⏰ {formatTime(med.reminderTime)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { setSelectedMed(med); setLogModalOpen(true) }}
                  >
                    Log
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeactivate(med.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Medication">
        <form onSubmit={handleAdd} className="space-y-3">
          <Input label="Medication Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Dosage" placeholder="e.g. 500mg" value={form.dosage} onChange={(e) => setForm(p => ({ ...p, dosage: e.target.value }))} required />
          <Input label="Frequency" placeholder="e.g. Once daily" value={form.frequency} onChange={(e) => setForm(p => ({ ...p, frequency: e.target.value }))} required />
          <Input label="Reminder Time" type="time" value={form.reminderTime} onChange={(e) => setForm(p => ({ ...p, reminderTime: e.target.value }))} required />
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))} required />
          <Button type="submit" className="w-full">Add Medication</Button>
        </form>
      </Modal>

      <Modal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} title={`Log: ${selectedMed?.name}`}>
        <p className="text-sm text-gray-500 mb-4">How was this medication taken?</p>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => handleLog('taken')}>✅ Taken</Button>
          <Button className="flex-1" variant="secondary" onClick={() => handleLog('skipped')}>⏭ Skipped</Button>
          <Button className="flex-1" variant="danger" onClick={() => handleLog('missed')}>❌ Missed</Button>
        </div>
      </Modal>
    </div>
  )
}