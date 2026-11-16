import { NextRequest } from 'next/server'
import { POST as verifyRazorpayPayment } from '../../razorpay/verify/route'

export async function POST(request: NextRequest) {
  return verifyRazorpayPayment(request)
}
