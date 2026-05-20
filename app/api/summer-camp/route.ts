import { google } from 'googleapis';
import { z } from 'zod';

import { ValidationError, ExternalServiceError } from '@/src/server/lib/errors';
import { logger } from '@/src/server/lib/logger';
import { withRoute } from '@/src/server/lib/route';
import { sendTelegramMessage, sendTelegramPhoto } from '@/src/server/services/telegram.service';

type SummerCampRegistrationPayload = {
  registrationType: 'existing' | 'new';
  skfId?: string;
  studentName: string;
  dob: string;
  age?: string;
  gender?: string;
  parentName: string;
  contactNumber: string;
  whatsappNumber?: string;
  area: string;
  schoolName: string;
  schoolKarate: string;
  karateExperience?: string;
  previouslyTrained?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  paymentProofBase64?: string;
  paymentProofName?: string;
  parentConsent?: boolean;
  photoPermission?: boolean;
  campRules?: boolean;
};

const MAX_REQUEST_BODY_BYTES = 1_200_000;
const MAX_PAYMENT_PROOF_BYTES = 750 * 1024;
const MAX_PAYMENT_PROOF_CHARS = Math.ceil((MAX_PAYMENT_PROOF_BYTES * 4) / 3) + 128;

const optionalText = (max = 160) => z.string().trim().max(max).optional().or(z.literal(''));
const paymentProofSchema = z.string()
  .trim()
  .max(MAX_PAYMENT_PROOF_CHARS)
  .regex(/^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/)
  .optional()
  .or(z.literal(''));

const summerCampRegistrationSchema = z.object({
  registrationType: z.enum(['existing', 'new']).default('new'),
  skfId: optionalText(80),
  studentName: z.string().trim().min(2).max(120),
  dob: z.string().trim().min(8).max(20),
  age: optionalText(10),
  gender: optionalText(30),
  parentName: z.string().trim().min(2).max(120),
  contactNumber: z.string().trim().min(6).max(30),
  whatsappNumber: optionalText(30),
  area: z.string().trim().min(2).max(160),
  schoolName: z.string().trim().min(2).max(160),
  schoolKarate: z.string().trim().min(1).max(80),
  karateExperience: optionalText(80),
  previouslyTrained: optionalText(80),
  emergencyContact: optionalText(30),
  medicalConditions: optionalText(500),
  paymentProofBase64: paymentProofSchema,
  paymentProofName: optionalText(255),
  parentConsent: z.boolean().optional(),
  photoPermission: z.boolean().optional(),
  campRules: z.boolean().optional(),
}).superRefine((data, context) => {
  if (data.registrationType === 'existing' && !data.skfId?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['skfId'],
      message: 'SKF ID is required for existing members.',
    });
  }

  if (!data.parentConsent || !data.campRules) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['parentConsent'],
      message: 'Parent consent and camp rules acceptance are required.',
    });
  }
});

function safeSheetCell(value: unknown) {
  const text = String(value ?? '').trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function getPaymentProof(data: SummerCampRegistrationPayload) {
  if (!data.paymentProofBase64 || data.registrationType === 'existing') return null;

  const match = data.paymentProofBase64.match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new ValidationError({ paymentProofBase64: ['Invalid payment proof image.'] });
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_PAYMENT_PROOF_BYTES) {
    throw new ValidationError({ paymentProofBase64: ['Payment proof must be 750 KB or smaller.'] });
  }

  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  return {
    buffer,
    filename: data.paymentProofName?.trim() || `payment-proof.${extension}`,
  };
}

export const POST = withRoute(
  {
    bodySchema: summerCampRegistrationSchema,
    rateLimit: { tier: 'contact' },
    maxBodyBytes: MAX_REQUEST_BODY_BYTES,
  },
  async ({ body: data, requestId }) => {
    // Environment variables
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID_SUMMER_CAMP;
    
    const isExisting = data.registrationType === 'existing';

    let telegramNotified = 'No';
    const proof = getPaymentProof(data);

    // 1. Send to Telegram orders channel
    try {
      const message = [
        'New summer camp registration',
        '',
        `Type: ${isExisting ? 'Existing Member' : 'New Participant'}`,
        `Name: ${data.studentName}`,
        data.skfId ? `SKF ID: ${data.skfId}` : '',
        `Contact: ${data.contactNumber}`,
        `School: ${data.schoolName} (Karate in School: ${data.schoolKarate})`,
        isExisting ? '' : 'Deposit: ₹300 (Paid via UPI)',
      ].filter(Boolean).join('\n');

      if (proof) {
        const result = await sendTelegramPhoto({
          channel: 'orders',
          caption: message,
          photo: new Blob([proof.buffer]),
          filename: proof.filename,
        });

        if (result.ok) telegramNotified = 'Yes';
        else logger.warn('summer_camp.telegram_photo_failed', { requestId, status: result.status, skipped: result.skipped, error: result.error });
      } else {
        const result = await sendTelegramMessage({ channel: 'orders', text: message });

        if (result.ok) telegramNotified = 'Yes';
        else logger.warn('summer_camp.telegram_message_failed', { requestId, status: result.status, skipped: result.skipped, error: result.error });
      }
    } catch (e: unknown) {
      logger.error('summer_camp.telegram_failed', { requestId, error: e });
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
          safeSheetCell(data.registrationType),
          safeSheetCell(data.skfId || ''),
          safeSheetCell(data.studentName),
          safeSheetCell(data.dob),
          safeSheetCell(data.age || ''),
          safeSheetCell(data.gender || ''),
          safeSheetCell(data.parentName),
          safeSheetCell(data.contactNumber),
          safeSheetCell(data.whatsappNumber || ''),
          safeSheetCell(data.area),
          safeSheetCell(data.schoolName),
          safeSheetCell(data.schoolKarate),
          safeSheetCell(data.karateExperience || ''),
          safeSheetCell(data.previouslyTrained || ''),
          safeSheetCell(data.emergencyContact),
          safeSheetCell(data.medicalConditions || ''),
          isExisting ? '0' : '300', // Deposit Amount
          isExisting ? 'N/A' : 'Paid',
          proof ? 'Sent via Telegram' : '',
          data.parentConsent ? 'Yes' : 'No',
          data.photoPermission ? 'Yes' : 'No',
          data.campRules ? 'Yes' : 'No',
          telegramNotified, // Telegram Notified
          isExisting ? 'N/A' : 'No', // Payment Verified (Admin updates this later)
          isExisting ? 'N/A' : 'No', // Refund Eligible
          isExisting ? 'N/A' : 'No', // Refund Paid
          '0', // Attendance %
          '' // Notes
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: `'Summer Camp Enrollments'!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [row],
          },
        });
      } catch (e: unknown) {
        logger.error('summer_camp.sheets_failed', { requestId, error: e });
        throw new ExternalServiceError('Failed to save registration. Please try again shortly.');
      }
    } else {
      logger.warn('summer_camp.sheets_missing_credentials', { requestId });
      if (telegramNotified !== 'Yes') {
        throw new ExternalServiceError('Registration service is not configured.');
      }
    }

    return Response.json({ success: true, telegramNotified });
  }
);
