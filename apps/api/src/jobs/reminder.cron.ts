import { startMedicationReminders } from '../modules/medications/med.cron'
import { startWeeklyDigest } from '../modules/ai/digest.cron'
import { startTrendAlerts } from '../modules/ai/trends.cron'

export const startAllJobs = () => {
  startMedicationReminders()
  startWeeklyDigest()
  startTrendAlerts()
  console.log('✅ All cron jobs started')
}