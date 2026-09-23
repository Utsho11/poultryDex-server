import { z } from 'zod';

export const healthRecordValidationSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  type: z.enum(['checkup', 'vaccination', 'injection', 'treatment']),
  description: z.string().min(2, 'Description is required'),
  medicineUsed: z.string().optional(),
  performedBy: z.string().min(1, 'Performed by name is required'),
  cost: z.number().min(0).optional(),
  attachmentUrls: z.array(z.string()).optional(),
});

export const updateHealthRecordValidationSchema = healthRecordValidationSchema.partial();

export const HealthRecordValidation = {
  healthRecordValidationSchema,
  updateHealthRecordValidationSchema,
};
