import { z } from 'zod';

export const createUserValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['manager', 'worker']),
  phone: z.string().min(6, 'Phone number must be at least 6 digits').optional().or(z.literal(''))
}).refine(data => (data.email && data.email.trim().length > 0) || (data.phone && data.phone.trim().length > 0), {
  message: 'Please provide either an email address or a phone number for the team member',
  path: ['email']
});

export const updateOwnProfileValidationSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
});

export const changeOwnPasswordValidationSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateUserRoleValidationSchema = z.object({
  role: z.enum(['manager', 'worker'])
});

export const UserValidation = {
  createUserValidationSchema,
  updateOwnProfileValidationSchema,
  changeOwnPasswordValidationSchema,
  updateUserRoleValidationSchema,
};
