export interface CertEmailProps {
  parentName: string
  studentName: string
  programName: string
  skfId: string
}

export function certificateReadyTemplate({ parentName, studentName, programName, skfId }: CertEmailProps) {
  return {
    subject: `🥋 ${studentName}'s certificate is ready — SKF Karate`,
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
              <p>Dear ${parentName},</p>
              <p>${studentName} has successfully completed <strong style="color:#f39c12">${programName}</strong> and their digital certificate is now ready to download.</p>
              <div style="text-align:center; margin:32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" 
                   style="background:#c0392b; color:#fff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:bold;">
                  Download Certificate
                </a>
              </div>
              <p style="font-size:13px; color:#999;">
                Login to the portal → Certificates tab → Click View<br/>
                SKF ID: ${skfId}
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
