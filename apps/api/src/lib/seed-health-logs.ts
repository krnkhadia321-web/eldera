import { prisma } from './prisma'

async function main() {
  const ELDER_EMAIL = 'test@eldera.com'

  const user = await prisma.user.findUnique({
    where: { email: ELDER_EMAIL },
    include: { elderProfile: true },
  })
  if (!user?.elderProfile) {
    console.log(`❌ Elder profile for ${ELDER_EMAIL} not found`)
    return
  }
  const elderId = user.elderProfile.id

  await prisma.healthLog.deleteMany({ where: { elderId } })

  const today = Date.now()
  const day = 24 * 60 * 60 * 1000

  const logs = []
  for (let i = 13; i >= 0; i--) {
    const loggedAt = new Date(today - i * day)

    const isRecent = i < 7
    const moodScore = isRecent
      ? 4 + Math.floor(Math.random() * 2)
      : 7 + Math.floor(Math.random() * 2)
    const bpSystolic = isRecent
      ? 150 + Math.floor(Math.random() * 15)
      : 128 + Math.floor(Math.random() * 8)
    const bpDiastolic = isRecent
      ? 95 + Math.floor(Math.random() * 8)
      : 82 + Math.floor(Math.random() * 5)
    const spo2 = isRecent
      ? 92 + Math.floor(Math.random() * 3)
      : 97 + Math.floor(Math.random() * 2)
    const weightKg =
      isRecent
        ? 68 + Math.random() * 0.5
        : 70 + Math.random() * 0.4

    logs.push({
      elderId,
      moodScore,
      bpSystolic,
      bpDiastolic,
      spo2,
      weightKg: Math.round(weightKg * 10) / 10,
      loggedAt,
    })
  }

  await prisma.healthLog.createMany({ data: logs })
  console.log(`✅ Seeded ${logs.length} health logs for ${ELDER_EMAIL}`)
  console.log(`   Elder ID: ${elderId}`)
  console.log(`\nNow hit: GET /api/ai/trends/${elderId}?days=14`)

  await prisma.$disconnect()
}

main()
