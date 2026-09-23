import { z } from 'zod';

export const dailyLogValidationSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  entryId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  eggCount: z.number().min(0, 'Egg count cannot be negative').default(0),
  brokenEggCount: z.number().min(0, 'Broken egg count cannot be negative').default(0),
  deadCount: z.number().min(0, 'Dead bird count cannot be negative').default(0),
  feedGivenKg: z.number().min(0, 'Feed amount cannot be negative').default(0),
  waterGivenLiters: z.number().min(0, 'Water amount cannot be negative').default(0),
  medicineGiven: z.array(z.object({
    name: z.string(),
    dose: z.string(),
    unit: z.string()
  })).optional(),
  notes: z.string().optional()
});

export const updateDailyLogValidationSchema = dailyLogValidationSchema.partial();

export const DailyLogValidation = {
  dailyLogValidationSchema,
  updateDailyLogValidationSchema,
};
