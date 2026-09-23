import { z } from 'zod';

export const expenseValidationSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required').optional(),
  workerId: z.string().optional(),
  category: z.enum(['feed', 'medicine', 'labor', 'utility', 'equipment', 'other']),
  amount: z.number().positive('Expense amount must be positive'),
  currency: z.string().default('BDT'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  note: z.string().optional(),
  receiptUrl: z.string().optional(),
  feedBags: z.number().min(0).optional(),
  feedKg: z.number().min(0).optional()
});

export const updateExpenseValidationSchema = expenseValidationSchema.partial();

export const ExpenseValidation = {
  expenseValidationSchema,
  updateExpenseValidationSchema,
};
