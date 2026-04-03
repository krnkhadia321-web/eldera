import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export const GROQ_MODEL = 'llama-3.3-70b-versatile'

export const chatWithGroq = async (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  systemPrompt?: string
) => {
  const allMessages = systemPrompt
    ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
    : messages

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: allMessages,
    temperature: 0.7,
    max_tokens: 1024,
  })

  return response.choices[0]?.message?.content || ''
}