import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { HealthTrendsCard } from '../../components/health/HealthTrendsCard'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import { formatDate, getMoodLabel } from '../../lib/utils'

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  totalAmount: number
  caregiver: { user: { fullName: string } }
}

interface DashboardStats {
  healthSummary: {
    avgMoodScore: number
    latestBP: string | null
    latestWeight: number | null
    latestSpo2: number | null
    logsCount: number
  } | null
  upcomingAppointments: Array<{
    id: string
    scheduledAt: string
    type: string
    doctor: { user: { fullName: string } }
  }>
  unresolvedAlerts: Array<{
    id: string
    alertType: string
    severity: string
    message: string
  }>
  activeMedications: Array<{
    id: string
    name: string
    dosage: string
    reminderTime: string
  }>
  bookings: Booking[]
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    healthSummary: null,
    upcomingAppointments: [],
    unresolvedAlerts: [],
    activeMedications: [],
    bookings: [],
  })
  const [elderId, setElderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
  try {
    if (user?.role === 'elder') {
      const elderRes = await api.get('/elders/me')
      const elder = elderRes.data.data
      setElderId(elder.id)

      const results = await Promise.allSettled([
        api.get(`/health-logs/${elder.id}/summary`),
        api.get(`/alerts/${elder.id}/unresolved`),
        api.get(`/medications/${elder.id}`),
        api.get(`/appointments/upcoming/${elder.id}`),
        api.get(`/bookings?elderId=${elder.id}`),
      ])

      setStats({
        healthSummary: results[0].status === 'fulfilled' ? results[0].value.data.data : null,
        unresolvedAlerts: results[1].status === 'fulfilled' ? results[1].value.data.data : [],
        activeMedications: results[2].status === 'fulfilled' ? results[2].value.data.data : [],
        upcomingAppointments: results[3].status === 'fulfilled' ? results[3].value.data.data : [],
        bookings: results[4].status === 'fulfilled' ? results[4].value.data.data : [],
      })
    }
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}
    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const mood = stats.healthSummary ? getMoodLabel(stats.healthSummary.avgMoodScore) : null

  const getStatusVariant = (status: string) => {
    if (status === 'confirmed') return 'green'
    if (status === 'cancelled') return 'red'
    if (status === 'completed') return 'gray'
    return 'yellow'
  }

  return (
    <div>
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Welcome back, {user?.fullName} 👋
          </h3>
          <p className="text-sm text-gray-500">Here's what's happening today</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {stats.healthSummary?.avgMoodScore ?? '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg Mood</p>
            {mood && <p className={`text-xs font-medium mt-1 ${mood.color}`}>{mood.label}</p>}
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.healthSummary?.latestBP ?? '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Blood Pressure</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {stats.healthSummary?.latestSpo2 ? `${stats.healthSummary.latestSpo2}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">SpO2</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {stats.unresolvedAlerts.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Active Alerts</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {elderId && (
            <HealthTrendsCard elderId={elderId} className="md:col-span-2" />
          )}

          <Card>
            <h4 className="font-semibold text-gray-900 mb-3">Today's Medications 💊</h4>
            {stats.activeMedications.length === 0 ? (
              <p className="text-sm text-gray-400">No active medications</p>
            ) : (
              <div className="space-y-2">
                {stats.activeMedications.slice(0, 4).map((med) => (
                  <div key={med.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.dosage}</p>
                    </div>
                    <Badge label={med.reminderTime} variant="blue" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h4 className="font-semibold text-gray-900 mb-3">Upcoming Appointments 🩺</h4>
            {stats.upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming appointments</p>
            ) : (
              <div className="space-y-2">
                {stats.upcomingAppointments.slice(0, 3).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dr. {appt.doctor.user.fullName}</p>
                      <p className="text-xs text-gray-500">{formatDate(appt.scheduledAt)}</p>
                    </div>
                    <Badge label={appt.type === 'telehealth' ? 'Video' : 'In-clinic'} variant={appt.type === 'telehealth' ? 'blue' : 'green'} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-3">Caregiver Bookings 🤝</h4>
            {stats.bookings.length === 0 ? (
              <p className="text-sm text-gray-400">No bookings yet</p>
            ) : (
              <div className="space-y-2">
                {stats.bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.caregiver.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.startTime)} → {formatDate(booking.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        ₹{booking.totalAmount.toFixed(0)}
                      </span>
                      <Badge
                        label={booking.status}
                        variant={getStatusVariant(booking.status) as 'green' | 'red' | 'gray' | 'yellow'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {stats.unresolvedAlerts.length > 0 && (
            <Card className="md:col-span-2">
              <h4 className="font-semibold text-gray-900 mb-3">Active Alerts 🚨</h4>
              <div className="space-y-2">
                {stats.unresolvedAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-sm text-red-700">{alert.message}</p>
                    <Badge label={alert.severity} variant={alert.severity === 'critical' ? 'red' : 'yellow'} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}