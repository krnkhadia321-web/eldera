import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['elder', 'family', 'caregiver', 'doctor']),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const elderProfileSchema = z.object({
  dateOfBirth: z.string(),
  bloodGroup: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  emergencyContact: z.string().min(10, 'Emergency contact is required'),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
})

export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  reminderTime: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
})

export const healthLogSchema = z.object({
  moodScore: z.number().min(1).max(10),
  bpSystolic: z.number().optional(),
  bpDiastolic: z.number().optional(),
  weightKg: z.number().optional(),
  spo2: z.number().optional(),
  notes: z.string().optional(),
})

export const bookingSchema = z.object({
  elderId: z.string().uuid(),
  caregiverId: z.string().uuid(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
})

export const appointmentSchema = z.object({
  elderId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string(),
  type: z.enum(['in_clinic', 'telehealth']),
  notes: z.string().optional(),
})

export const expenseSchema = z.object({
  category: z.enum(['medical', 'caregiver', 'medication', 'grocery', 'utility', 'other']),
  amount: z.number().positive(),
  description: z.string().min(1),
  expenseDate: z.string(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ElderProfileInput = z.infer<typeof elderProfileSchema>
export type MedicationInput = z.infer<typeof medicationSchema>
export type HealthLogInput = z.infer<typeof healthLogSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>