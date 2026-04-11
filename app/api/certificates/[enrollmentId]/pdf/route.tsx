import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { CertificatePDF } from '@/lib/certificates/CertificatePDF'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'
import React from 'react'

export async function GET(request: Request, props: { params: Promise<{ enrollmentId: string }> }) {
  const params = await props.params
  try {
    const { searchParams } = new URL(request.url)
    const skfId = searchParams.get('skfId') || ''
    const isAdmin = searchParams.get('admin') === 'true' // simplified access for proof of concept

    const renderer = new CertificateRenderer()
    const data = await renderer.getData(params.enrollmentId, skfId, isAdmin)

    const stream = await renderToStream(<CertificatePDF data={data} />)
    
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.studentName.replace(/\s+/g, '_')}_${data.programName}_Certificate.pdf"`
      }
    })
  } catch (error: any) {
    console.error('PDF Generation Error:', error)
    return new Response(error.message || 'Internal Server Error', { status: 500 })
  }
}
