import { prisma } from '../../lib/prisma'
import { chatWithGroq } from '../../lib/groq'
import { createError } from '../../middleware/errorHandler'

const COMPANION_SYSTEM_PROMPT = `You are EldEra Companion, a warm, caring AI assistant dedicated to supporting elderly individuals in India. Your role is to:
- Have friendly, supportive conversations in simple language
- Ask about their day, health, and wellbeing
- Gently remind them about medications if mentioned
- Detect signs of loneliness, sadness, or distress
- Never give medical advice — always suggest consulting a doctor
- Be culturally sensitive to Indian values and traditions
- Keep responses concise and easy to understand
- If the person seems very distressed, encourage them to contact their family

Always respond with warmth and patience. Address them respectfully.`

export const sendCompanionMessage = async (
  elderId: string,
  userMessage: string
) => {
  const existing = await prisma.aiConversation.findFirst({
    where: { elderId },
    orderBy: { createdAt: 'desc' },
  })

  const messages: { role: 'user' | 'assistant'; content: string }[] =
    existing ? (existing.messages as { role: 'user' | 'assistant'; content: string }[]) : []

  messages.push({ role: 'user', content: userMessage })

  const reply = await chatWithGroq(messages, COMPANION_SYSTEM_PROMPT)

  messages.push({ role: 'assistant', content: reply })

  const moodDetected = detectMood(userMessage + ' ' + reply)

  await prisma.aiConversation.create({
    data: {
      elderId,
      messages,
      moodDetected,
      flagged: moodDetected !== null && moodDetected <= 3,
    },
  })

  return { reply, moodDetected }
}

export const getConversationHistory = async (elderId: string) => {
  return prisma.aiConversation.findMany({
    where: { elderId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

export const getFlaggedConversations = async (elderId: string) => {
  return prisma.aiConversation.findMany({
    where: { elderId, flagged: true },
    orderBy: { createdAt: 'desc' },
  })
}

const detectMood = (text: string): number | null => {
  const lowerText = text.toLowerCase()

  const negativeWords = [
    'sad', 'lonely', 'alone', 'depressed', 'unhappy', 'pain',
    'suffering', 'terrible', 'awful', 'hopeless', 'worried', 'anxious',
    'scared', 'frightened', 'akela', 'dard', 'takleef',
  ]

  const positiveWords = [
    'happy', 'good', 'great', 'wonderful', 'blessed', 'thankful',
    'fine', 'well', 'better', 'excellent', 'khush', 'acha',
  ]

  const negCount = negativeWords.filter((w) => lowerText.includes(w)).length
  const posCount = positiveWords.filter((w) => lowerText.includes(w)).length

  if (negCount === 0 && posCount === 0) return null
  if (negCount > posCount) return Math.max(1, 5 - negCount)
  return Math.min(10, 6 + posCount)
}