import { z } from 'zod';

export const createFarmValidationSchema = z.object({
  name: z.string().min(2, 'Firm name must be at least 2 characters'),
  animalType: z.enum(['poultry', 'layer', 'broiler']),
  date: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().default('Asia/Dhaka')
});

export const updateFarmValidationSchema = z.object({
  name: z.string().min(2).optional(),
  animalType: z.enum(['poultry', 'layer', 'broiler']).optional(),
  date: z.string().optional(),
  location: z.string().optional(),
});

export const FarmValidation = {
  createFarmValidationSchema,
  updateFarmValidationSchema,
};
