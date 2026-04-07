import React, { useEffect, useState } from 'react'
import { TopBar } from '../../components/layout/TopBar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency } from '../../lib/utils'

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  totalAmount: number
  notes: string
  elder: { user: { fullName: string; phone: string } }
  family: { name: string }
}

interface CaregiverProfile {
  id: string
  hourlyRate: number
  rating: number
  isAvailable: boolean
  city: string
}

export default function CaregiverDashboard() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [profile, setProfile] = useState<CaregiverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState(0)

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Get caregiver profile by searching caregivers
      const caregiversRes = await api.get('/caregivers')
      const allCaregivers = caregiversRes.data.data
      
      // Find this caregiver's profile by matching user email
      const myProfile = allCaregivers.find(
        (cg: { user: { fullName: string }; id: string; isAvailable: boolean; hourlyRate: number; rating: number; city: string }) =>
          cg.user.fullName === user?.fullName
      )

      if (myProfile) {
        setProfile(myProfile)
        // Fetch bookings using caregiver profile ID
        const bookingsRes = await api.get(`/bookings?caregiverId=${myProfile.id}`)
        const allBookings = bookingsRes.data.data
        setBookings(allBookings)

        const totalEarnings = allBookings
          .filter((b: Booking) => b.status === 'completed')
          .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0)
        setEarnings(totalEarnings)
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
    bookingId: string,
    status: 'confirmed' | 'cancelled' | 'completed'
  ) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status })
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      )
      toast.success(`Booking ${status}`)
    } catch {
      toast.error('Failed to update booking')
    }
  }

  const handleToggleAvailability = async () => {
    if (!profile) return
    try {
      await api.patch('/caregivers/availability', {
        isAvailable: !profile.isAvailable,
      })
      setProfile((prev) =>
        prev ? { ...prev, isAvailable: !prev.isAvailable } : null
      )
      toast.success('Availability updated')
    } catch {
      toast.error('Failed to update availability')
    }
  }

  const getStatusVariant = (status: string) => {
    if (status === 'confirmed') return 'green'
    if (status === 'cancelled') return 'red'
    if (status === 'completed') return 'gray'
    return 'yellow'
  }

  const pendingBookings = bookings.filter((b) => b.status === 'pending')
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Caregiver Dashboard" />
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Welcome, {user?.fullName} 🤝
          </h3>
          <p className="text-sm text-gray-500">Manage your bookings and schedule</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingBookings.length}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Requests</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600">{confirmedBookings.length}</p>
            <p className="text-xs text-gray-500 mt-1">Confirmed</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === 'completed').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(earnings)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Earned</p>
          </Card>
        </div>

        {/* Availability Toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Availability Status</h4>
              <p className="text-sm text-gray-500">
                {profile?.isAvailable
                  ? 'You are currently accepting bookings'
                  : 'You are not accepting bookings'}
              </p>
            </div>
            <Button
              variant={profile?.isAvailable ? 'danger' : 'primary'}
              onClick={handleToggleAvailability}
            >
              {profile?.isAvailable ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </Card>

        {/* Pending Requests */}
        {pendingBookings.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              🔔 Pending Requests ({pendingBookings.length})
            </h4>
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-l-4 border-l-yellow-400">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.elder.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        📞 {booking.elder.user.phone}
                      </p>
                      <p className="text-sm text-gray-500">
                        📅 {formatDate(booking.startTime)} → {formatDate(booking.endTime)}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 mt-1">📝 {booking.notes}</p>
                      )}
                      <p className="text-sm font-medium text-green-600 mt-1">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      >
                        ✅ Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Bookings */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">All Bookings</h4>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <Card>
                <p className="text-sm text-gray-400 text-center py-4">
                  No bookings yet. Make sure your profile is verified and you're online.
                </p>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.elder.user.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(booking.startTime)} → {formatDate(booking.endTime)}
                      </p>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        label={booking.status}
                        variant={getStatusVariant(booking.status) as 'green' | 'red' | 'gray' | 'yellow'}
                      />
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(booking.id, 'completed')}
                        >
                          Mark Done
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}