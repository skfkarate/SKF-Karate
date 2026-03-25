/**
 * Generates the HTML template for the "Certificate Ready" email notification.
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} params.programName
 * @param {string} params.skfId
 * @param {string} params.portalUrl
 */
export function certificateReadyTemplate({ studentName, programName, skfId, portalUrl = 'https://skfkarate.com/portal' }) {
  return {
    subject: `🥋 Your Official SKF Karate Certificate is Ready!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #05080f; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffb703; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">SKF Karate</h1>
          <p style="color: #ffffff; opacity: 0.7; margin: 8px 0 0 0; font-size: 14px;">Official Federation Notification</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px;">Congratulations, ${studentName}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
            The central SKF administrative board has officially approved the results for the <strong>${programName}</strong>.
            Your digital certificate has been generated and unlocked in your student portal.
          </p>

          <div style="background-color: #f3f4f6; border-left: 4px solid #c0392b; padding: 16px; margin-bottom: 32px;">
            <p style="margin: 0; color: #374151; font-weight: 600;">Student ID: ${skfId}</p>
          </div>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
            You can now download your high-resolution Certificate (PDF or Image) directly from the authenticated SKF portal.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${portalUrl}" style="background-color: #c0392b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">
              Login to SKF Portal
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an automated notification from SKF Karate. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    `
  }
}
