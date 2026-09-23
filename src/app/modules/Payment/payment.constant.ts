export const PAYMENT_METHOD = {
  cash: 'cash',
  bkash: 'bkash',
  bank: 'bank',
  other: 'other',
} as const;

export const paymentSearchableFields = ['notes', 'date', 'method'];
