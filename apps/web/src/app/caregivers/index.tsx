import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../lib/utils'

interface Caregiver {
  id: string
  bio: string
  skills: string[]
  languages: string[]
  city: string
  hourlyRate: number
  rating: number
  isAvailable: boolean
  user: { fullName: string; avatarUrl: string }
}

export default function CaregiversPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Caregiver | null>(null)
  const [bookingModal, setBookingModal] = useState(false)
  const [cityFilter, setCityFilter] = useState('')
  const [bookingForm, setBookingForm] = useState({
    elderId: '', familyId: '', startTime: '', endTime: '', notes: ''
  })

  useEffect(() => {
    fetchCaregivers()
  }, [])

  const fetchCaregivers = async (city?: string) => {
    try {
      const params = city ? `?city=${city}` : ''
      const res = await api.get(`/caregivers${params}`)
      setCaregivers(res.data.data)
    } catch {
      toast.error('Failed to load caregivers')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    try {
      await api.post('/bookings', {
        ...bookingForm,
        caregiverId: selected.id,
      })
      toast.success('Booking request sent!')
      setBookingModal(false)
      setBookingForm({ elderId: '', familyId: '', startTime: '', endTime: '', notes: '' })
    } catch {
      toast.error('Failed to create booking')
    }
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Caregivers" />
      <div className="p-6 space-y-6">
        <div className="flex gap-3">
          <Input
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={() => fetchCaregivers(cityFilter)} variant="secondary">
            Filter
          </Button>
          <Button onClick={() => { setCityFilter(''); fetchCaregivers() }} variant="ghost">
            Clear
          </Button>
        </div>

        {caregivers.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400 text-center py-8">
              No verified caregivers available yet
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {caregivers.map((cg) => (
              <Card key={cg.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                      🤝
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cg.user.fullName}</p>
                      <p className="text-sm text-gray-500">{cg.city}</p>
                      <p className="text-xs text-gray-400">{renderStars(cg.rating)} ({cg.rating.toFixed(1)})</p>
                    </div>
                  </div>
                  <Badge
                    label={cg.isAvailable ? 'Available' : 'Busy'}
                    variant={cg.isAvailable ? 'green' : 'red'}
                  />
                </div>

                {cg.bio && (
                  <p className="text-sm text-gray-600 mt-3">{cg.bio}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-1">
                  {cg.skills.map((skill: string) => (
                    <Badge key={skill} label={skill} variant="blue" />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {cg.languages.map((lang: string) => (
                    <Badge key={lang} label={lang} variant="gray" />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(cg.hourlyRate)}/hr
                  </p>
                  <Button
                    size="sm"
                    disabled={!cg.isAvailable}
                    onClick={() => { setSelected(cg); setBookingModal(true) }}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title={`Book ${selected?.user.fullName}`}>
        <form onSubmit={handleBook} className="space-y-3">
          <Input
            label="Elder ID"
            placeholder="Enter elder profile ID"
            value={bookingForm.elderId}
            onChange={(e) => setBookingForm(p => ({ ...p, elderId: e.target.value }))}
            required
          />
          <Input
            label="Family ID"
            placeholder="Enter family ID"
            value={bookingForm.familyId}
            onChange={(e) => setBookingForm(p => ({ ...p, familyId: e.target.value }))}
            required
          />
          <Input
            label="Start Time"
            type="datetime-local"
            value={bookingForm.startTime}
            onChange={(e) => setBookingForm(p => ({ ...p, startTime: e.target.value }))}
            required
          />
          <Input
            label="End Time"
            type="datetime-local"
            value={bookingForm.endTime}
            onChange={(e) => setBookingForm(p => ({ ...p, endTime: e.target.value }))}
            required
          />
          <Input
            label="Notes (optional)"
            placeholder="Any special instructions..."
            value={bookingForm.notes}
            onChange={(e) => setBookingForm(p => ({ ...p, notes: e.target.value }))}
          />
          {selected && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              Rate: {formatCurrency(selected.hourlyRate)}/hr · 12% platform fee applies
            </div>
          )}
          <Button type="submit" className="w-full">Confirm Booking</Button>
        </form>
      </Modal>
    </div>
  )
}