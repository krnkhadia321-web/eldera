import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

async function main() {
  const FAMILY_EMAIL = "krn.khadia321@gmail.com";
  const FAMILY_PASSWORD = "password123";
  const FAMILY_NAME = "Anshul (Family)";
  const ELDER_EMAIL = "test@eldera.com";

  const elderUser = await prisma.user.findUnique({
    where: { email: ELDER_EMAIL },
  });
  if (!elderUser) {
    console.log(`❌ Elder user ${ELDER_EMAIL} not found`);
    return;
  }

  const family = await prisma.family.findFirst({
    where: { createdBy: elderUser.id },
  });
  if (!family) {
    console.log("❌ Family not found — run seed-family.ts first");
    return;
  }

  const passwordHash = await bcrypt.hash(FAMILY_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: FAMILY_EMAIL },
    update: {},
    create: {
      fullName: FAMILY_NAME,
      email: FAMILY_EMAIL,
      phone: "9999999999",
      passwordHash,
      role: "family",
    },
  });
  console.log(`✅ Family user ready: ${user.email}`);

  const existing = await prisma.familyMember.findFirst({
    where: { familyId: family.id, userId: user.id },
  });

  if (existing) {
    console.log("✅ Already a member of the family");
  } else {
    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId: user.id,
        memberRole: "primary",
        isPrimary: false,
      },
    });
    console.log(`✅ Added to family: ${family.name}`);
  }

  console.log(`\n🔑 Login: ${FAMILY_EMAIL} / ${FAMILY_PASSWORD}`);
  await prisma.$disconnect();
}

main();
