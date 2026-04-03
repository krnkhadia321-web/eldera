import { createOrder, verifyPayment } from '../../lib/razorpay'
import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/errorHandler'

export const initiateBookingPayment = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) throw createError('Booking not found', 404)

  const order = await createOrder(
    booking.totalAmount,
    'INR',
    `booking_${bookingId}`
  )

  return {
    orderId: order.id,
    amount: booking.totalAmount,
    currency: 'INR',
    bookingId,
  }
}

export const confirmBookingPayment = async (
  bookingId: string,
  orderId: string,
  paymentId: string,
  signature: string
) => {
  const isValid = verifyPayment(orderId, paymentId, signature)

  if (!isValid) throw createError('Invalid payment signature', 400)

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'confirmed' },
  })

  return booking
}