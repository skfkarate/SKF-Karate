import { renderToBuffer } from '@react-pdf/renderer'
import { ReceiptDocument } from '@/lib/receipts/ReceiptDocument'
import { requireRole } from '@/lib/server/requireRole'
import { getFeesBySkfId, getStudentBySkfId } from '@/lib/server/sheets'

export async function GET(request: Request, props: { params: Promise<{ receiptId: string }> }) {
  const params = await props.params
  try {
    const jwt = await requireRole(['student', 'branch_admin', 'super_admin'])
    const { receiptId } = params
    
    // Security: verify this receipt belongs to this student
    // receiptId format: RCP_[skfId]_[month]_[year]
    const parts = receiptId.split('_')
    if (parts[1] !== jwt.skfId && jwt.role === 'student') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Fetch fee data from Sheets
    const fees = await getFeesBySkfId(parts[1])
    const feeRow = fees.find(f => f.receiptId === receiptId)
    if (!feeRow) return Response.json({ error: 'Receipt not found' }, { status: 404 })
    
    const student = await getStudentBySkfId(parts[1])
    if (!student) return Response.json({ error: 'Student not found' }, { status: 404 })
    
    const pdfBuffer = await renderToBuffer(
      <ReceiptDocument
        receiptId={receiptId}
        studentName={student.name}
        skfId={student.skfId}
        branch={student.branch}
        month={feeRow.month}
        year={feeRow.year}
        amount={feeRow.amount}
        paidDate={feeRow.paidDate!}
        paymentMethod={feeRow.paymentMethod || 'Online'}
        dojoAddress={`SKF Karate ${student.branch}, Bangalore`}
      />
    )
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${receiptId}.pdf"`
      }
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Receipt generation error:', error)
    return Response.json({ error: 'Failed to generate receipt' }, { status: 500 })
  }
}
