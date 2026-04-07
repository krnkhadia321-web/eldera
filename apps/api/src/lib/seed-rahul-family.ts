import { prisma } from './prisma'

async function main() {
  const rahul = await prisma.user.findUnique({
    where: { email: 'rahul@eldera.com' },
  })

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@eldera.com' },
  })

  if (!rahul || !testUser) {
    console.log('Users not found!')
    return
  }

  const family = await prisma.family.create({
    data: {
      name: 'Kumar Family',
      createdBy: rahul.id,
      members: {
        create: [
          { userId: rahul.id, memberRole: 'primary', isPrimary: true },
          { userId: testUser.id, memberRole: 'secondary', isPrimary: false },
        ],
      },
    },
  })

  console.log('✅ Family created:', family.id)
  console.log('✅ Linked Rahul Kumar + Test User (elder)')

  await prisma.$disconnect()
}

main()