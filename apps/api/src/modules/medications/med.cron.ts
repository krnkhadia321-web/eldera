import cron from 'node-cron'
import { prisma } from '../../lib/prisma'
import { createMissedMedAlert } from '../alerts/alert.service'
import { sendMedicationReminder } from '../notifications/email.service'

export const startMedicationReminders = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const medications = await prisma.medication.findMany({
      where: {
        isActive: true,
        reminderTime: currentTime,
      },
      include: {
        elder: {
          include: { user: true },
        },
      },
    })

    for (const med of medications) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const alreadyLogged = await prisma.medLog.findFirst({
        where: {
          medicationId: med.id,
          loggedAt: { gte: today },
        },
      })

      if (!alreadyLogged) {
        console.log(`⏰ Reminder: ${med.elder.user.fullName} should take ${med.name}`)
        if (med.elder.user.email) {
          await sendMedicationReminder(
            med.elder.user.email,
            med.elder.user.fullName,
            [{ name: med.name, dosage: med.dosage, time: med.reminderTime }]
          )
        }
      }
    }
  })

  cron.schedule('0 * * * *', async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const hourStr = `${oneHourAgo.getHours().toString().padStart(2, '0')}:${oneHourAgo.getMinutes().toString().padStart(2, '0')}`

    const missedMeds = await prisma.medication.findMany({
      where: {
        isActive: true,
        reminderTime: hourStr,
      },
    })

    for (const med of missedMeds) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const logged = await prisma.medLog.findFirst({
        where: {
          medicationId: med.id,
          loggedAt: { gte: today },
        },
      })

      if (!logged) {
        await createMissedMedAlert(med.elderId, med.name)
        console.log(`🔴 Missed medication alert created for ${med.name}`)
      }
    }
  })

  console.log('✅ Medication reminder cron started')
}