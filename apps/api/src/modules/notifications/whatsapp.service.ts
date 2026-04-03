import { sendWhatsApp } from '../../lib/twilio'

export const sendMedicationReminder = async (
  phone: string,
  elderName: string,
  medicationName: string,
  dosage: string
) => {
  const message = `🔔 EldEra Reminder\n\nHello! Time for ${elderName} to take:\n💊 ${medicationName} — ${dosage}\n\nPlease confirm once taken. Stay healthy! 🙏`
  await sendWhatsApp(phone, message)
}

export const sendSOSWhatsApp = async (
  phone: string,
  elderName: string,
  message: string
) => {
  const text = `🆘 EMERGENCY ALERT — EldEra\n\n${elderName} has triggered an SOS!\n\n${message}\n\nPlease respond immediately.`
  await sendWhatsApp(phone, text)
}

export const sendAppointmentReminder = async (
  phone: string,
  elderName: string,
  doctorName: string,
  scheduledAt: string
) => {
  const message = `📅 EldEra Appointment Reminder\n\n${elderName} has an appointment with Dr. ${doctorName}\n🕐 ${scheduledAt}\n\nPlease ensure they are ready on time.`
  await sendWhatsApp(phone, message)
}

export const sendWeeklyDigestWhatsApp = async (
  phone: string,
  elderName: string,
  summary: string
) => {
  const message = `📊 EldEra Weekly Summary\n\n${elderName}'s health this week:\n\n${summary}\n\nLog in to EldEra for full details.`
  await sendWhatsApp(phone, message)
}