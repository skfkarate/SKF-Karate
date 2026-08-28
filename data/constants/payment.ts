export const PAYMENT_DETAILS = {
  accountHolder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER || '',
  phoneNumber: process.env.NEXT_PUBLIC_PAYMENT_PHONE || '',
  scannerPath: '/ScanToPay.jpeg',
  upiId: process.env.NEXT_PUBLIC_PAYMENT_UPI_ID || '',
} as const
