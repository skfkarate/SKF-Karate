import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Environment variables
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID_SUMMER_CAMP;
    
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    let telegramNotified = 'No';
    let telegramError = '';

    // 1. Send to Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const message = `
🥋 *New Summer Camp Registration*
*Type:* ${data.registrationType === 'existing' ? 'Existing Member' : 'New Participant'}
*Name:* ${data.studentName}
${data.skfId ? `*SKF ID:* ${data.skfId}` : ''}
*Contact:* ${data.contactNumber}
*School:* ${data.schoolName}
*Deposit:* ₹300 (Paid via UPI)
        `;

        // If there's an image, send as photo with caption, else send message
        if (data.paymentProofBase64) {
          // Convert base64 to Buffer
          const base64Data = data.paymentProofBase64.split(';base64,').pop();
          const buffer = Buffer.from(base64Data, 'base64');
          
          const formData = new FormData();
          formData.append('chat_id', TELEGRAM_CHAT_ID);
          formData.append('caption', message);
          formData.append('parse_mode', 'Markdown');
          formData.append('photo', new Blob([buffer]), data.paymentProofName || 'screenshot.jpg');

          const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData,
          });
          
          if (tgRes.ok) telegramNotified = 'Yes';
          else telegramError = await tgRes.text();
        } else {
          const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message,
              parse_mode: 'Markdown',
            }),
          });
          
          if (tgRes.ok) telegramNotified = 'Yes';
          else telegramError = await tgRes.text();
        }
      } catch (e: any) {
        console.error('Telegram Error:', e);
        telegramError = e.message;
      }
    }

    // 2. Save to Google Sheets
    if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_SHEET_ID) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: GOOGLE_CLIENT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY,
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const row = [
          new Date().toISOString(),
          data.registrationType,
          data.skfId || '',
          data.studentName,
          data.dob,
          data.age || '',
          data.gender || '',
          data.parentName,
          data.contactNumber,
          data.whatsappNumber || '',
          data.area,
          data.schoolName,
          data.schoolKarate,
          data.karateExperience || '',
          data.previouslyTrained || '',
          data.emergencyContact,
          data.medicalConditions || '',
          '300', // Deposit Amount
          'Paid',
          data.paymentProofBase64 ? 'Sent via Telegram' : '',
          data.parentConsent ? 'Yes' : 'No',
          data.photoPermission ? 'Yes' : 'No',
          data.campRules ? 'Yes' : 'No',
          telegramNotified, // Telegram Notified
          'No', // Payment Verified (Admin updates this later)
          'No', // Refund Eligible
          'No', // Refund Paid
          '0', // Attendance %
          '' // Notes
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: `'nunchaku'!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [row],
          },
        });
      } catch (e: any) {
        console.error('Google Sheets Error:', e);
        // If sheet fails but telegram succeeded, we still return success with warning maybe?
        // Or fail the whole thing. Better to throw so user knows.
        throw new Error('Failed to save to database (Google Sheets): ' + e.message);
      }
    } else {
      console.warn('Google Sheets credentials not fully configured.');
    }

    return NextResponse.json({ success: true, telegramNotified });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
