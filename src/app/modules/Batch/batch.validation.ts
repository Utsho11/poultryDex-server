import { z } from 'zod';

export const createBatchValidationSchema = z.object({
  name: z.string().min(2, 'Batch name must be at least 2 characters'),
  breed: z.string().min(1, 'Breed is required'),
  type: z.enum(['layer', 'broiler']).optional(),
  shed: z.string().optional(),
  startDate: z.string().or(z.date()),
  initialCount: z.coerce.number().int().positive('Initial count must be greater than 0'),
  assignedWorkerIds: z.array(z.string()).optional(),
  password: z.string().optional()
});

export const updateBatchValidationSchema = createBatchValidationSchema.partial();

export const assignWorkersValidationSchema = z.object({
  workerIds: z.array(z.string()).optional(),
  assignedWorkerIds: z.array(z.string()).optional(),
});

export const BatchValidation = {
  createBatchValidationSchema,
  updateBatchValidationSchema,
  assignWorkersValidationSchema,
};
