import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
})

export const createOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string
) => {
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt,
  })
  return order
}

export const verifyPayment = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET!)
    .update(body)
    .digest('hex')

  return expectedSignature === signature
}