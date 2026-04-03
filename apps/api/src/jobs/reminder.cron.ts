import { startMedicationReminders } from '../modules/medications/med.cron'
import { startWeeklyDigest } from '../modules/ai/digest.cron'

export const startAllJobs = () => {
  startMedicationReminders()
  startWeeklyDigest()
  console.log('✅ All cron jobs started')
}