export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export const getMoodLabel = (score: number) => {
  if (score >= 8) return { label: 'Great', color: 'text-green-600' }
  if (score >= 6) return { label: 'Good', color: 'text-blue-600' }
  if (score >= 4) return { label: 'Okay', color: 'text-yellow-600' }
  return { label: 'Low', color: 'text-red-600' }
}

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}