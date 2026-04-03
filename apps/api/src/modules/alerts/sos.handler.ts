import { Server } from 'socket.io'
import { prisma } from '../../lib/prisma'
import { emitSOSAlert } from '../../sockets/alert.socket'
import { triggerSOS } from './alert.service'

export const handleSOSWithNotifications = async (
  io: Server,
  elderId: string,
  triggeredBy: string
) => {
  const { alert, elder } = await triggerSOS(elderId, triggeredBy)

  const familyMembers = await prisma.familyMember.findMany({
    where: {
      family: {
        members: {
          some: {
            user: {
              elderProfile: {
                id: elderId,
              },
            },
          },
        },
      },
    },
    include: {
      family: true,
    },
  })

  const familyIds: string[] = Array.from(
    new Set(familyMembers.map((m) => m.familyId as string))
  )

  for (const familyId of familyIds) {
    emitSOSAlert(io, familyId, {
      elderId,
      elderName: elder.user.fullName,
      message: alert.message,
      triggeredAt: alert.triggeredAt.toISOString(),
    })
  }

  await prisma.notification.createMany({
    data: familyMembers.map((m: { userId: string; familyId: string }) => ({
      userId: m.userId,
      title: 'SOS Alert',
      body: `${elder.user.fullName} has triggered an SOS alert. Please check immediately.`,
      channel: 'in_app' as const,
    })),
  })

  return alert
}