export interface CertEmailProps {
  parentName: string
  studentName: string
  programName: string
  skfId: string
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.skfkarate.org'

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function certificateReadyTemplate({ parentName, studentName, programName, skfId }: CertEmailProps) {
  const safeParent = escapeHtml(parentName)
  const safeStudent = escapeHtml(studentName)
  const safeProgram = escapeHtml(programName)
  const safeSkfId = escapeHtml(skfId)

  return {
    subject: `\u{1F94B} ${safeStudent}'s certificate is ready \u2014 SKF Karate`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin:0; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background:#05080f; border-radius:12px; overflow:hidden;">
            <div style="background: linear-gradient(135deg, #c0392b, #96281b); padding:24px; text-align:center;">
              <h1 style="color:#f39c12; margin:0; font-size:24px;">SKF Karate</h1>
              <p style="color:#fff; margin:8px 0 0;">Certificate Ready</p>
            </div>
            <div style="padding:32px; color:#fff;">
              <p>Dear ${safeParent},</p>
              <p>${safeStudent} has successfully completed <strong style="color:#f39c12">${safeProgram}</strong> and their digital certificate is now ready to download.</p>
              <div style="text-align:center; margin:32px 0;">
                <a href="${appUrl}/portal"
                   style="background:#c0392b; color:#fff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:bold;">
                  Download Certificate
                </a>
              </div>
              <p style="font-size:13px; color:#999;">
                Login to the portal \u2192 Certificates tab \u2192 Click View<br/>
                SKF ID: ${safeSkfId}
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
