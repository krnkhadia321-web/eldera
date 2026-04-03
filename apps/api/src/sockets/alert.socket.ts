import { Server } from 'socket.io'
import { emitToFamily } from './socket.gateway'

export const emitSOSAlert = (
  io: Server,
  familyId: string,
  data: {
    elderId: string
    elderName: string
    message: string
    triggeredAt: string
  }
) => {
  emitToFamily(io, familyId, 'alert:sos', data)
}

export const emitMedicationMissed = (
  io: Server,
  familyId: string,
  data: {
    elderId: string
    elderName: string
    medicationName: string
    scheduledTime: string
  }
) => {
  emitToFamily(io, familyId, 'alert:medication_missed', data)
}

export const emitLowMood = (
  io: Server,
  familyId: string,
  data: {
    elderId: string
    elderName: string
    moodScore: number
    consecutiveDays: number
  }
) => {
  emitToFamily(io, familyId, 'alert:low_mood', data)
}