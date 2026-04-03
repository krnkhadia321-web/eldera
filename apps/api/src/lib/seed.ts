import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding database...')

  // Create caregiver users
  const caregiverData = [
    { fullName: 'Priya Sharma', email: 'priya@eldera.com', phone: '9876501001', city: 'Delhi', hourlyRate: 150, bio: 'Experienced caregiver with 5+ years working with elderly patients. Specialized in post-surgery care and physiotherapy assistance.', skills: ['Post-surgery care', 'Physiotherapy', 'Medication management'], languages: ['Hindi', 'English'] },
    { fullName: 'Anjali Verma', email: 'anjali@eldera.com', phone: '9876501002', city: 'Mumbai', hourlyRate: 180, bio: 'Certified nursing assistant with expertise in dementia and Alzheimer\'s care. Fluent in Marathi and Hindi.', skills: ['Dementia care', 'Alzheimer\'s', 'Companionship'], languages: ['Hindi', 'Marathi', 'English'] },
    { fullName: 'Ramesh Gupta', email: 'ramesh@eldera.com', phone: '9876501003', city: 'Delhi', hourlyRate: 130, bio: 'Male caregiver with experience in mobility assistance and daily living support for elderly men.', skills: ['Mobility assistance', 'Daily living support', 'Bathing & grooming'], languages: ['Hindi', 'Punjabi'] },
    { fullName: 'Sunita Nair', email: 'sunita@eldera.com', phone: '9876501004', city: 'Bangalore', hourlyRate: 160, bio: 'Compassionate caregiver specializing in palliative care and chronic disease management.', skills: ['Palliative care', 'Chronic disease', 'Wound care'], languages: ['Kannada', 'English', 'Hindi'] },
    { fullName: 'Meena Pillai', email: 'meena@eldera.com', phone: '9876501005', city: 'Chennai', hourlyRate: 140, bio: 'Trained in geriatric care with special focus on nutrition and meal preparation for diabetic patients.', skills: ['Geriatric care', 'Diabetic nutrition', 'Meal prep'], languages: ['Tamil', 'English'] },
  ]

  for (const cg of caregiverData) {
    const passwordHash = await bcrypt.hash('password123', 12)
    const user = await prisma.user.upsert({
      where: { email: cg.email },
      update: {},
      create: {
        fullName: cg.fullName,
        email: cg.email,
        phone: cg.phone,
        passwordHash,
        role: 'caregiver',
      },
    })

    await prisma.caregiver.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: cg.bio,
        skills: cg.skills,
        languages: cg.languages,
        city: cg.city,
        hourlyRate: cg.hourlyRate,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        isVerified: true,
        isAvailable: true,
      },
    })
    console.log(`✅ Caregiver created: ${cg.fullName}`)
  }

  // Create doctor users
  const doctorData = [
    { fullName: 'Dr. Arun Mehta', email: 'arun@eldera.com', phone: '9876502001', specialty: 'Geriatrics', clinicName: 'Mehta Geriatric Care', city: 'Delhi', consultationFee: 800, offersTelehealth: true },
    { fullName: 'Dr. Kavita Rao', email: 'kavita@eldera.com', phone: '9876502002', specialty: 'Cardiology', clinicName: 'Heart Care Clinic', city: 'Mumbai', consultationFee: 1200, offersTelehealth: true },
    { fullName: 'Dr. Suresh Iyer', email: 'suresh@eldera.com', phone: '9876502003', specialty: 'Neurology', clinicName: 'Brain & Spine Centre', city: 'Bangalore', consultationFee: 1000, offersTelehealth: false },
    { fullName: 'Dr. Nisha Patel', email: 'nisha@eldera.com', phone: '9876502004', specialty: 'Orthopedics', clinicName: 'Patel Bone & Joint', city: 'Ahmedabad', consultationFee: 700, offersTelehealth: true },
    { fullName: 'Dr. Rajiv Kapoor', email: 'rajiv@eldera.com', phone: '9876502005', specialty: 'Diabetology', clinicName: 'Diabetes Wellness Centre', city: 'Delhi', consultationFee: 600, offersTelehealth: true },
    { fullName: 'Dr. Lakshmi Menon', email: 'lakshmi@eldera.com', phone: '9876502006', specialty: 'Physiotherapy', clinicName: 'Menon Rehab Centre', city: 'Chennai', consultationFee: 500, offersTelehealth: false },
  ]

  for (const doc of doctorData) {
    const passwordHash = await bcrypt.hash('password123', 12)
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        fullName: doc.fullName,
        email: doc.email,
        phone: doc.phone,
        passwordHash,
        role: 'doctor',
      },
    })

    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialty: doc.specialty,
        clinicName: doc.clinicName,
        city: doc.city,
        consultationFee: doc.consultationFee,
        offersTelehealth: doc.offersTelehealth,
        rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
      },
    })
    console.log(`✅ Doctor created: ${doc.fullName}`)
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })