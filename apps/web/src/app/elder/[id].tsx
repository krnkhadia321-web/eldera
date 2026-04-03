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
import { formatDate } from '../../lib/utils'

interface ElderProfile {
  id: string
  dateOfBirth: string
  bloodGroup: string
  address: string
  city: string
  emergencyContact: string
  medicalConditions: string
  allergies: string
  user: { fullName: string; email: string; phone: string }
}

interface HealthLog {
  id: string
  moodScore: number
  bpSystolic: number
  bpDiastolic: number
  weightKg: number
  spo2: number
  notes: string
  loggedAt: string
}

export default function ElderPage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<ElderProfile | null>(null)
  const [logs, setLogs] = useState<HealthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [healthModalOpen, setHealthModalOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({
    dateOfBirth: '', bloodGroup: '', address: '',
    city: '', emergencyContact: '', medicalConditions: '', allergies: ''
  })
  const [healthForm, setHealthForm] = useState({
    moodScore: 7, bpSystolic: '', bpDiastolic: '',
    weightKg: '', spo2: '', notes: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elderRes = await api.get('/elders/me')
        setProfile(elderRes.data.data)
        const logsRes = await api.get(`/health-logs/${elderRes.data.data.id}?take=5`)
        setLogs(logsRes.data.data)
      } catch {
        console.error('No elder profile yet')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/elders/profile', profileForm)
      setProfile(res.data.data)
      setProfileModalOpen(false)
      toast.success('Profile created!')
    } catch {
      toast.error('Failed to create profile')
    }
  }

  const handleLogHealth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    try {
      await api.post('/health-logs', {
        elderId: profile.id,
        moodScore: Number(healthForm.moodScore),
        bpSystolic: healthForm.bpSystolic ? Number(healthForm.bpSystolic) : undefined,
        bpDiastolic: healthForm.bpDiastolic ? Number(healthForm.bpDiastolic) : undefined,
        weightKg: healthForm.weightKg ? Number(healthForm.weightKg) : undefined,
        spo2: healthForm.spo2 ? Number(healthForm.spo2) : undefined,
        notes: healthForm.notes || undefined,
      })
      const logsRes = await api.get(`/health-logs/${profile.id}?take=5`)
      setLogs(logsRes.data.data)
      setHealthModalOpen(false)
      toast.success('Health log saved!')
    } catch {
      toast.error('Failed to save health log')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <TopBar title="Elder Profile" />
      <div className="p-6 space-y-6">
        {!profile ? (
          <Card className="text-center py-12">
            <p className="text-4xl mb-4">👴</p>
            <h3 className="font-semibold text-gray-900 mb-2">No profile yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your elder profile to get started</p>
            <Button onClick={() => setProfileModalOpen(true)}>Create Profile</Button>
          </Card>
        ) : (
          <>
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
                    👴
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{profile.user.fullName}</h3>
                    <p className="text-sm text-gray-500">{profile.user.email}</p>
                    <p className="text-sm text-gray-500">{profile.user.phone}</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setHealthModalOpen(true)}>
                  + Log Health
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-xs text-gray-400">Date of Birth</p>
                  <p className="text-sm font-medium">{formatDate(profile.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Blood Group</p>
                  <p className="text-sm font-medium">{profile.bloodGroup || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">City</p>
                  <p className="text-sm font-medium">{profile.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Emergency Contact</p>
                  <p className="text-sm font-medium">{profile.emergencyContact}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-medium">{profile.address}</p>
                </div>
              </div>

              {(profile.medicalConditions || profile.allergies) && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 flex-wrap">
                  {profile.medicalConditions && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Medical Conditions</p>
                      <Badge label={profile.medicalConditions} variant="yellow" />
                    </div>
                  )}
                  {profile.allergies && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Allergies</p>
                      <Badge label={profile.allergies} variant="red" />
                    </div>
                  )}
                </div>
              )}
            </Card>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recent Health Logs</h4>
              {logs.length === 0 ? (
                <Card><p className="text-sm text-gray-400 text-center py-4">No health logs yet</p></Card>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <Card key={log.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{log.moodScore}</p>
                            <p className="text-xs text-gray-400">Mood</p>
                          </div>
                          {log.bpSystolic && (
                            <div className="text-center">
                              <p className="text-lg font-semibold text-green-600">{log.bpSystolic}/{log.bpDiastolic}</p>
                              <p className="text-xs text-gray-400">BP</p>
                            </div>
                          )}
                          {log.spo2 && (
                            <div className="text-center">
                              <p className="text-lg font-semibold text-purple-600">{log.spo2}%</p>
                              <p className="text-xs text-gray-400">SpO2</p>
                            </div>
                          )}
                          {log.weightKg && (
                            <div className="text-center">
                              <p className="text-lg font-semibold text-orange-600">{log.weightKg}kg</p>
                              <p className="text-xs text-gray-400">Weight</p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(log.loggedAt)}</p>
                      </div>
                      {log.notes && <p className="text-sm text-gray-500 mt-2">{log.notes}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Create Elder Profile">
        <form onSubmit={handleCreateProfile} className="space-y-3">
          <Input label="Date of Birth" type="date" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm(p => ({ ...p, dateOfBirth: e.target.value }))} required />
          <Input label="Blood Group" placeholder="e.g. O+" value={profileForm.bloodGroup} onChange={(e) => setProfileForm(p => ({ ...p, bloodGroup: e.target.value }))} />
          <Input label="Address" value={profileForm.address} onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))} required />
          <Input label="City" value={profileForm.city} onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))} required />
          <Input label="Emergency Contact" placeholder="Phone number" value={profileForm.emergencyContact} onChange={(e) => setProfileForm(p => ({ ...p, emergencyContact: e.target.value }))} required />
          <Input label="Medical Conditions" placeholder="e.g. Diabetes, Hypertension" value={profileForm.medicalConditions} onChange={(e) => setProfileForm(p => ({ ...p, medicalConditions: e.target.value }))} />
          <Input label="Allergies" placeholder="e.g. Penicillin" value={profileForm.allergies} onChange={(e) => setProfileForm(p => ({ ...p, allergies: e.target.value }))} />
          <Button type="submit" className="w-full">Create Profile</Button>
        </form>
      </Modal>

      <Modal isOpen={healthModalOpen} onClose={() => setHealthModalOpen(false)} title="Log Health Data">
        <form onSubmit={handleLogHealth} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mood Score: {healthForm.moodScore}/10
            </label>
            <input type="range" min={1} max={10} value={healthForm.moodScore}
              onChange={(e) => setHealthForm(p => ({ ...p, moodScore: Number(e.target.value) }))}
              className="w-full accent-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="BP Systolic" type="number" placeholder="120" value={healthForm.bpSystolic} onChange={(e) => setHealthForm(p => ({ ...p, bpSystolic: e.target.value }))} />
            <Input label="BP Diastolic" type="number" placeholder="80" value={healthForm.bpDiastolic} onChange={(e) => setHealthForm(p => ({ ...p, bpDiastolic: e.target.value }))} />
          </div>
          <Input label="Weight (kg)" type="number" placeholder="70" value={healthForm.weightKg} onChange={(e) => setHealthForm(p => ({ ...p, weightKg: e.target.value }))} />
          <Input label="SpO2 (%)" type="number" placeholder="98" value={healthForm.spo2} onChange={(e) => setHealthForm(p => ({ ...p, spo2: e.target.value }))} />
          <Input label="Notes" placeholder="How are you feeling?" value={healthForm.notes} onChange={(e) => setHealthForm(p => ({ ...p, notes: e.target.value }))} />
          <Button type="submit" className="w-full">Save Log</Button>
        </form>
      </Modal>
    </div>
  )
}