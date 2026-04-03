export const elderSelectPublic = {
  id: true,
  userId: true,
  dateOfBirth: true,
  bloodGroup: true,
  address: true,
  city: true,
  emergencyContact: true,
  medicalConditions: true,
  allergies: true,
  createdAt: true,
  user: {
    select: {
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  },
}

export const elderSelectWithMeds = {
  ...elderSelectPublic,
  medications: {
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      dosage: true,
      frequency: true,
      reminderTime: true,
    },
  },
}