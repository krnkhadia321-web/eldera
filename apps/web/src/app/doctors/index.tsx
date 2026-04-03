import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../lib/utils'

interface Doctor {
  id: string
  specialty: string
  clinicName: string
  city: string
  consultationFee: number
  rating: number
  offersTelehealth: boolean
  user: { fullName: string; avatarUrl: string }
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Doctor | null>(null)
  const [apptModal, setApptModal] = useState(false)
  const [apptForm, setApptForm] = useState({
    elderId: '', familyId: '', scheduledAt: '', type: 'in_clinic', notes: ''
  })

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/doctors')
        setDoctors(res.data.data)
      } catch {
        toast.error('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    try {
      await api.post('/appointments', {
        ...apptForm,
        doctorId: selected.id,
      })
      toast.success('Appointment booked!')
      setApptModal(false)
    } catch {
      toast.error('Failed to book appointment')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Doctors" />
      <div className="p-6 space-y-6">
        {doctors.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400 text-center py-8">No doctors listed yet</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <Card key={doc.id}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                    🩺
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Dr. {doc.user.fullName}</p>
                    <p className="text-sm text-blue-600">{doc.specialty}</p>
                    <p className="text-sm text-gray-500">{doc.clinicName} · {doc.city}</p>
                    <div className="flex gap-2 mt-2">
                      {doc.offersTelehealth && <Badge label="Telehealth" variant="blue" />}
                      <Badge label={`⭐ ${doc.rating.toFixed(1)}`} variant="yellow" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(doc.consultationFee)}
                  </p>
                  <Button size="sm" onClick={() => { setSelected(doc); setApptModal(true) }}>
                    Book Appointment
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={apptModal} onClose={() => setApptModal(false)} title={`Appointment with Dr. ${selected?.user.fullName}`}>
        <form onSubmit={handleBook} className="space-y-3">
          <Input label="Elder ID" placeholder="Elder profile ID" value={apptForm.elderId} onChange={(e) => setApptForm(p => ({ ...p, elderId: e.target.value }))} required />
          <Input label="Family ID" placeholder="Family ID" value={apptForm.familyId} onChange={(e) => setApptForm(p => ({ ...p, familyId: e.target.value }))} required />
          <Input label="Date & Time" type="datetime-local" value={apptForm.scheduledAt} onChange={(e) => setApptForm(p => ({ ...p, scheduledAt: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={apptForm.type}
              onChange={(e) => setApptForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="in_clinic">In Clinic</option>
              {selected?.offersTelehealth && <option value="telehealth">Telehealth (Video)</option>}
            </select>
          </div>
          <Input label="Notes (optional)" value={apptForm.notes} onChange={(e) => setApptForm(p => ({ ...p, notes: e.target.value }))} />
          <Button type="submit" className="w-full">Confirm Appointment</Button>
        </form>
      </Modal>
    </div>
  )
}