export const sendSMS = async (to: string, message: string): Promise<void> => {
  console.log(`SMS to ${to}: ${message}`)
}

export const sendWhatsApp = async (to: string, message: string): Promise<void> => {
  console.log(`WhatsApp to ${to}: ${message}`)
}