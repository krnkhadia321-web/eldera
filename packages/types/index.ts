export type UserRole = 'elder' | 'family' | 'caregiver' | 'doctor' | 'admin'

export type MemberRole = 'primary' | 'secondary'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type AppointmentType = 'in_clinic' | 'telehealth'

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export type MedLogStatus = 'taken' | 'missed' | 'skipped'

export type AlertType = 'sos' | 'missed_medication' | 'low_mood' | 'fall' | 'inactivity'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type DocType = 'medical_record' | 'prescription' | 'insurance' | 'legal' | 'identity' | 'other'

export type ExpenseCategory = 'medical' | 'caregiver' | 'medication' | 'grocery' | 'utility' | 'other'

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp'

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  avatarUrl?: string
  createdAt: Date
}

export interface ElderProfile {
  id: string
  userId: string
  dateOfBirth: Date
  bloodGroup?: string
  address: string
  city: string
  emergencyContact: string
  medicalConditions?: string
  allergies?: string
  createdAt: Date
}

export interface Family {
  id: string
  name: string
  createdBy: string
  createdAt: Date
}

export interface Caregiver {
  id: string
  userId: string
  bio?: string
  skills: string[]
  languages: string[]
  city: string
  hourlyRate: number
  rating: number
  isVerified: boolean
  isAvailable: boolean
}

export interface Booking {
  id: string
  elderId: string
  caregiverId: string
  familyId: string
  startTime: Date
  endTime: Date
  status: BookingStatus
  totalAmount: number
  platformFee: number
  notes?: string
}

export interface Medication {
  id: string
  elderId: string
  name: string
  dosage: string
  frequency: string
  reminderTime: string
  startDate: Date
  endDate?: Date
  isActive: boolean
}

export interface HealthLog {
  id: string
  elderId: string
  moodScore: number
  bpSystolic?: number
  bpDiastolic?: number
  weightKg?: number
  spo2?: number
  notes?: string
  loggedAt: Date
}

export interface Alert {
  id: string
  elderId: string
  triggeredBy: string
  alertType: AlertType
  severity: AlertSeverity
  message: string
  resolved: boolean
  triggeredAt: Date
}