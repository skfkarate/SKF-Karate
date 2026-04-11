import { NextResponse } from 'next/server'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'

export async function GET(request: Request, props: { params: Promise<{ enrollmentId: string }> }) {
  const params = await props.params
  try {
    const { searchParams } = new URL(request.url)
    const skfId = searchParams.get('skfId') || ''
    const isAdmin = searchParams.get('admin') === 'true'

    const renderer = new CertificateRenderer()
    const data = await renderer.getData(params.enrollmentId, skfId, isAdmin)
    
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
