import { z } from 'zod';

export const paymentValidationSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  saleId: z.string().optional(),
  amount: z.number().positive('Payment amount must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  method: z.enum(['cash', 'bkash', 'bank', 'other']).default('cash'),
  notes: z.string().optional(),
});

export const updatePaymentValidationSchema = paymentValidationSchema.partial();

export const PaymentValidation = {
  paymentValidationSchema,
  updatePaymentValidationSchema,
};
