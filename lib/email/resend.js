import { Resend } from 'resend'

// Initialize the Resend client with the API key from environments
// If the key is missing (during local dev setup), it will fail gracefully
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export function isEmailConfigured() {
  return resend !== null
}
