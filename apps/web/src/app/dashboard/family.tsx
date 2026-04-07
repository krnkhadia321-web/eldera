import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../lib/constants'

interface Elder {
  id: string
  city: string
  bloodGroup: string
  medicalConditions: string
  emergencyContact: string
  user: { fullName: string; phone: string; email: string }
  medications: Array<{ id: string; name: string; dosage: string; reminderTime: string }>
}

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  totalAmount: number
  caregiver: { user: { fullName: string } }
}

interface Alert {
  id: string
  alertType: string
  severity: string
  message: string
  resolved: boolean
  triggeredAt: string
}

export default function FamilyDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [elders, setElders] = useState<Elder[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
  try {
    const familyRes = await api.get('/families/my')
    const families = familyRes.data.data
    if (families.length === 0) return

    const family = families[0].family
    setFamilyId(family.id)

    const bookingsRes = await api.get(`/bookings?familyId=${family.id}`)
    setBookings(bookingsRes.data.data)

    // Get full family details with members
    const fullFamilyRes = await api.get(`/families/${family.id}`)
    const fullFamily = fullFamilyRes.data.data

    const allAlerts: Alert[] = []
    const elderProfiles: Elder[] = []

    for (const member of fullFamily.members) {
      if (member.user.role === 'elder') {
        try {
          // Fetch elder profile by userId
          const elderRes = await api.get(`/elders/me`)
          // Actually fetch by searching
          const searchRes = await api.get(`/users/${member.user.id}`)
          const userId = searchRes.data.data.id

          // Find elder profile for this user
          const allEldersRes = await api.get(`/elders/family/${family.id}`)
          const familyElders = allEldersRes.data.data

          for (const elder of familyElders) {
            if (elder) {
              elderProfiles.push(elder)
              const alertRes = await api.get(`/alerts/${elder.id}/unresolved`)
              allAlerts.push(...alertRes.data.data)
            }
          }
        } catch (err) {
          console.error(err)
        }
        break
      }
    }

    setElders(elderProfiles)
    setAlerts(allAlerts)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}
    fetchData()
  }, [user])

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.patch(`/alerts/${alertId}/resolve`)
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      toast.success('Alert resolved')
    } catch {
      toast.error('Failed to resolve alert')
    }
  }

  const getSeverityVariant = (severity: string) => {
    if (severity === 'critical' || severity === 'high') return 'red'
    if (severity === 'medium') return 'yellow'
    return 'gray'
  }

  const getAlertIcon = (type: string) => {
    if (type === 'sos') return '🆘'
    if (type === 'missed_medication') return '💊'
    if (type === 'low_mood') return '😔'
    return '⚠️'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Family Dashboard" />
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Welcome, {user?.fullName} 👨‍👩‍👧
          </h3>
          <p className="text-sm text-gray-500">Monitor your family's care</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600">{elders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Elders</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active Alerts</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter((b) => b.status === 'confirmed').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Active Bookings</p>
          </Card>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <h4 className="font-semibold text-red-800 mb-3">🚨 Active Alerts</h4>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getAlertIcon(alert.alertType)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-400">{formatDate(alert.triggeredAt)}</p>
                    </div>
                    <Badge
                      label={alert.severity}
                      variant={getSeverityVariant(alert.severity) as 'red' | 'yellow' | 'gray'}
                    />
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleResolveAlert(alert.id)}>
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Elder Profiles */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">👴 Elder Profiles</h4>
          {elders.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-400 text-center py-4">
                No elders linked to your family yet
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {elders.map((elder) => (
                <Card key={elder.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                        👴
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{elder.user.fullName}</p>
                        <p className="text-sm text-gray-500">{elder.user.phone}</p>
                        <p className="text-sm text-gray-500">{elder.city}</p>
                        {elder.medicalConditions && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ {elder.medicalConditions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(ROUTES.CAREGIVERS)}
                      >
                        Book Caregiver
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(ROUTES.DOCTORS)}
                      >
                        Book Doctor
                      </Button>
                    </div>
                  </div>
                  {elder.medications && elder.medications.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2">Active Medications</p>
                      <div className="flex flex-wrap gap-1">
                        {elder.medications.map((med) => (
                          <Badge key={med.id} label={`${med.name} ${med.dosage}`} variant="blue" />
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Caregiver Bookings */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">🤝 Caregiver Bookings</h4>
          {bookings.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-400 text-center py-4">No bookings yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.caregiver.user.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(booking.startTime)} → {formatDate(booking.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{formatCurrency(booking.totalAmount)}</p>
                      <Badge
                        label={booking.status}
                        variant={
                          booking.status === 'confirmed' ? 'green' :
                          booking.status === 'cancelled' ? 'red' :
                          booking.status === 'completed' ? 'gray' : 'yellow'
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}