export const ROLES = {
  ELDER: 'elder',
  FAMILY: 'family',
  CAREGIVER: 'caregiver',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
} as const

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const ALERT_TYPE = {
  SOS: 'sos',
  MISSED_MEDICATION: 'missed_medication',
  LOW_MOOD: 'low_mood',
  FALL: 'fall',
  INACTIVITY: 'inactivity',
} as const

export const EXPENSE_CATEGORY = {
  MEDICAL: 'medical',
  CAREGIVER: 'caregiver',
  MEDICATION: 'medication',
  GROCERY: 'grocery',
  UTILITY: 'utility',
  OTHER: 'other',
} as const

export const PLATFORM_FEE_PERCENT = 12

export const MOOD_ALERT_THRESHOLD = 3
export const MOOD_ALERT_CONSECUTIVE_DAYS = 3

export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  ELDERS: '/api/elders',
  FAMILIES: '/api/families',
  CAREGIVERS: '/api/caregivers',
  BOOKINGS: '/api/bookings',
  DOCTORS: '/api/doctors',
  APPOINTMENTS: '/api/appointments',
  MEDICATIONS: '/api/medications',
  HEALTH_LOGS: '/api/health-logs',
  DOCUMENTS: '/api/documents',
  ALERTS: '/api/alerts',
  EXPENSES: '/api/expenses',
  AI: '/api/ai',
  NOTIFICATIONS: '/api/notifications',
} as const