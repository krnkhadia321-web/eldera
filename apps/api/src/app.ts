import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { authRouter } from './modules/auth/auth.router'
import { elderRouter } from './modules/elders/elder.router'
import { familyRouter } from './modules/families/family.router'
import { caregiverRouter } from './modules/caregivers/caregiver.router'
import { bookingRouter } from './modules/bookings/booking.router'
import { doctorRouter } from './modules/doctors/doctor.router'
import { appointmentRouter } from './modules/appointments/appointment.router'
import { medicationRouter } from './modules/medications/medication.router'
import { healthLogRouter } from './modules/health-logs/healthlog.router'
import { documentRouter } from './modules/documents/document.router'
import { alertRouter } from './modules/alerts/alert.router'
import { expenseRouter } from './modules/expenses/expense.router'
import { aiRouter } from './modules/ai/companion.router'
import { notificationRouter } from './modules/notifications/notification.service'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { API_ROUTES } from '@eldera/config'
import { usersRouter } from './modules/users/users.router'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(rateLimiter)

app.use(API_ROUTES.AUTH, authRouter)
app.use(API_ROUTES.ELDERS, elderRouter)
app.use(API_ROUTES.FAMILIES, familyRouter)
app.use(API_ROUTES.CAREGIVERS, caregiverRouter)
app.use(API_ROUTES.BOOKINGS, bookingRouter)
app.use(API_ROUTES.DOCTORS, doctorRouter)
app.use(API_ROUTES.APPOINTMENTS, appointmentRouter)
app.use(API_ROUTES.MEDICATIONS, medicationRouter)
app.use(API_ROUTES.HEALTH_LOGS, healthLogRouter)
app.use(API_ROUTES.DOCUMENTS, documentRouter)
app.use(API_ROUTES.ALERTS, alertRouter)
app.use(API_ROUTES.EXPENSES, expenseRouter)
app.use(API_ROUTES.AI, aiRouter)
app.use(API_ROUTES.USERS, usersRouter)
app.use(API_ROUTES.NOTIFICATIONS, notificationRouter)

app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

export default app