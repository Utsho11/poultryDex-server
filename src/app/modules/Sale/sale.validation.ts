import { z } from 'zod';

export const saleItemValidationSchema = z.object({
  type: z.enum(['egg', 'chicken']),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  crates: z.number().min(0).optional(),
  looseEggs: z.number().min(0).optional(),
  birdCount: z.number().min(0).optional(),
  weightKg: z.number().min(0).optional(),
  unit: z.enum(['piece', 'tray', 'kg', 'bird']).default('piece'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  subtotal: z.number().min(0).optional(),
});

export const saleValidationSchema = z.object({
  batchId: z.string().optional(),
  itemType: z.enum(['egg', 'chicken']).optional(),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().min(0).optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(saleItemValidationSchema).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  amountPaid: z.number().min(0, 'Amount paid cannot be negative').default(0),
  note: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSaleValidationSchema = saleValidationSchema.partial();

export const SaleValidation = {
  saleItemValidationSchema,
  saleValidationSchema,
  updateSaleValidationSchema,
};
