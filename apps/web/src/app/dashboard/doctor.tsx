import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatDate } from '../../lib/utils'

interface Appointment {
  id: string
  scheduledAt: string
  type: string
  status: string
  notes: string
  videoRoomUrl: string | null
  elder: { user: { fullName: string; phone: string } }
}

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [todayCount, setTodayCount] = useState(0)

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Get all doctors and find this doctor's profile
      const doctorsRes = await api.get('/doctors')
      const allDoctors = doctorsRes.data.data

      const myProfile = allDoctors.find(
        (d: { user: { fullName: string }; id: string }) =>
          d.user.fullName === user?.fullName
      )

      if (myProfile) {
        const apptRes = await api.get(`/appointments?doctorId=${myProfile.id}`)
        const allAppts = apptRes.data.data
        setAppointments(allAppts)

        const today = new Date().toDateString()
        const todayAppts = allAppts.filter(
          (a: Appointment) =>
            new Date(a.scheduledAt).toDateString() === today &&
            a.status === 'scheduled'
        )
        setTodayCount(todayAppts.length)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [user])

  const handleUpdateStatus = async (
    appointmentId: string,
    status: 'completed' | 'cancelled' | 'no_show'
  ) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status })
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
      )
      toast.success(`Appointment marked as ${status}`)
    } catch {
      toast.error('Failed to update appointment')
    }
  }

  const handleAddVideoLink = async (appointmentId: string) => {
    const url = prompt('Enter video room URL:')
    if (!url) return
    try {
      await api.patch(`/appointments/${appointmentId}/video-room`, { videoRoomUrl: url })
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, videoRoomUrl: url } : a))
      )
      toast.success('Video link added!')
    } catch {
      toast.error('Failed to add video link')
    }
  }

  const scheduled = appointments.filter((a) => a.status === 'scheduled')
  const completed = appointments.filter((a) => a.status === 'completed')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Doctor Dashboard" />
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Welcome, Dr. {user?.fullName} 🩺
          </h3>
          <p className="text-sm text-gray-500">Manage your appointments</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600">{todayCount}</p>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{scheduled.length}</p>
            <p className="text-xs text-gray-500 mt-1">Upcoming</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600">{completed.length}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </Card>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Upcoming Appointments</h4>
          <div className="space-y-3">
            {scheduled.length === 0 ? (
              <Card>
                <p className="text-sm text-gray-400 text-center py-4">No upcoming appointments</p>
              </Card>
            ) : (
              scheduled.map((appt) => (
                <Card key={appt.id} className="border-l-4 border-l-blue-400">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{appt.elder.user.fullName}</p>
                      <p className="text-sm text-gray-500">{appt.elder.user.phone}</p>
                      <p className="text-sm text-gray-500">{formatDate(appt.scheduledAt)}</p>
                      <Badge
                        label={appt.type === 'telehealth' ? 'Video' : 'In-clinic'}
                        variant={appt.type === 'telehealth' ? 'blue' : 'green'}
                      />
                      {appt.notes && (
                        <p className="text-sm text-gray-500 mt-1">{appt.notes}</p>
                      )}
                      {appt.videoRoomUrl && (
                        <p className="text-sm text-blue-600 mt-1">
                          Video link: {appt.videoRoomUrl}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {appt.type === 'telehealth' && !appt.videoRoomUrl && (
                        <Button size="sm" variant="secondary" onClick={() => handleAddVideoLink(appt.id)}>
                          + Video Link
                        </Button>
                      )}
                      <Button size="sm" onClick={() => handleUpdateStatus(appt.id, 'completed')}>
                        Complete
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(appt.id, 'cancelled')}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(appt.id, 'no_show')}>
                        No Show
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {completed.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Completed ({completed.length})</h4>
            <div className="space-y-2">
              {completed.slice(0, 5).map((appt) => (
                <Card key={appt.id} className="opacity-75">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{appt.elder.user.fullName}</p>
                      <p className="text-xs text-gray-400">{formatDate(appt.scheduledAt)}</p>
                    </div>
                    <Badge label="Completed" variant="green" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}