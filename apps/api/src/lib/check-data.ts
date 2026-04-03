import { prisma } from './prisma'

async function main() {
  const bookings = await prisma.booking.findMany({
    include: {
      caregiver: { include: { user: true } },
      elder: { include: { user: true } },
    },
  })

  console.log('📋 All bookings:', JSON.stringify(bookings.map(b => ({
    id: b.id,
    elderName: b.elder.user.fullName,
    elderId: b.elderId,
    caregiver: b.caregiver.user.fullName,
    status: b.status,
    amount: b.totalAmount,
  })), null, 2))

  await prisma.$disconnect()
}

main()