import Razorpay from 'razorpay'
import { requireRole } from '@/lib/server/requireRole'
import { getFeesBySkfId } from '@/lib/server/sheets'

const razorpay = new Razorpay({ 
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder', 
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder' 
})

export async function POST(request: Request) {
  try {
    const jwt = await requireRole(['student'])
    const { month, year } = await request.json()
    
    // Fetch fee amount for this student
    const fees = await getFeesBySkfId(jwt.skfId!)
    const feeRow = fees.find(f => f.month === month && f.year === year)
    if (!feeRow) return Response.json({ error: 'Fee not found' }, { status: 404 })
    
    const order = await razorpay.orders.create({
      amount: feeRow.amount * 100,  // Razorpay uses paise
      currency: 'INR',
      receipt: `fee_${jwt.skfId}_${month}_${year}`,
      notes: { skfId: jwt.skfId!, month, year: String(year), branch: jwt.branch! }
    })
    
    return Response.json({ orderId: order.id, amount: feeRow.amount, key: process.env.RAZORPAY_KEY_ID })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Razorpay order creation error:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
