import { z } from 'zod';

export const registerValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(6, 'Phone number must be at least 6 digits').optional().or(z.literal('')),
}).refine(data => (data.email && data.email.trim().length > 0) || (data.phone && data.phone.trim().length > 0), {
  message: 'Please provide either an email address or a phone number',
  path: ['email']
});

export const registerFarmValidationSchema = z.object({
  farmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(6, 'Phone number must be at least 6 digits').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  animalType: z.enum(['poultry', 'layer', 'broiler']).default('layer'),
  date: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().default('Asia/Dhaka')
}).refine((data) => (data.email && data.email.trim() !== '') || (data.phone && data.phone.trim() !== ''), {
  message: 'Either email or phone number is required to register a firm',
  path: ['email']
});

export const loginValidationSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone number is required').optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, 'Password is required')
});

export const switchFarmValidationSchema = z.object({
  farmId: z.string().min(1, 'Firm ID is required')
});

export const AuthValidation = {
  registerValidationSchema,
  registerFarmValidationSchema,
  loginValidationSchema,
  switchFarmValidationSchema,
};
