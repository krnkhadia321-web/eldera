import { prisma } from './prisma'

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@eldera.com' },
  })

  if (!user) {
    console.log('User not found!')
    return
  }

  const existingFamily = await prisma.family.findFirst({
    where: { createdBy: user.id },
  })

  let family = existingFamily

  if (!family) {
    family = await prisma.family.create({
      data: {
        name: 'Test Family',
        createdBy: user.id,
        members: {
          create: {
            userId: user.id,
            memberRole: 'primary',
            isPrimary: true,
          },
        },
      },
    })
    console.log('✅ Family created')
  } else {
    console.log('✅ Family already exists')
  }

  const elder = await prisma.elderProfile.findUnique({
    where: { userId: user.id },
  })

  console.log('👨‍👩‍👧 Family ID:', family.id)
  console.log('👴 Elder ID:', elder?.id)

  await prisma.$disconnect()
}

main()