import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'

export async function GET(request, { params }) {
  try {
    const { receiptId } = params

    // In a real system, you would fetch the payment record from the database 
    // using the receiptId. Here we generate a standard SKF Digital Receipt.
    
    // Create new PDF (Portrait A4)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Setup Fonts & Colors
    doc.setFont("helvetica")
    
    // --- Header Background ---
    doc.setFillColor(5, 8, 15) // SKF Navy
    doc.rect(0, 0, 210, 40, "F")
    
    // --- Header Text ---
    doc.setTextColor(255, 183, 3) // Gold
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("SKF KARATE", 105, 20, { align: "center" })
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("OFFICIAL PAYMENT RECEIPT", 105, 28, { align: "center" })

    // --- Receipt Details ---
    doc.setTextColor(0, 0, 0)
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Receipt ID:", 20, 60)
    doc.setFont("helvetica", "normal")
    doc.text(receiptId, 50, 60)

    doc.setFont("helvetica", "bold")
    doc.text("Date:", 20, 70)
    doc.setFont("helvetica", "normal")
    doc.text(new Date().toLocaleDateString(), 50, 70)

    // --- Payment Box ---
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(249, 250, 251)
    doc.rect(20, 90, 170, 60, "FD")

    doc.setFont("helvetica", "bold")
    doc.text("Description", 25, 100)
    doc.text("Amount (INR)", 160, 100)
    
    doc.line(20, 105, 190, 105)

    doc.setFont("helvetica", "normal")
    doc.text("Monthly Coaching Fee (Mock Generation)", 25, 115)
    doc.text("₹0.00", 160, 115)

    doc.line(20, 135, 190, 135)
    doc.setFont("helvetica", "bold")
    doc.text("Total Paid:", 120, 145)
    doc.text("₹0.00", 160, 145)

    // --- Footer ---
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(150, 150, 150)
    doc.text("This is a system-generated digital receipt. No signature is required.", 105, 270, { align: "center" })

    // Convert PDF to Buffer
    const pdfOutput = doc.output('arraybuffer')

    return new NextResponse(pdfOutput, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=SKF_Receipt_${receiptId}.pdf`
      }
    })

  } catch (error) {
    console.error('[API] Receipt generation error:', error)
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 })
  }
}
