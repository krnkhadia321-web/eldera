import twilio from 'twilio'

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const sendSMS = async (to: string, message: string): Promise<void> => {
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_SMS_FROM,
    to,
  })
}

export const sendWhatsApp = async (
  to: string,
  message: string
): Promise<void> => {
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${to}`,
  })
}