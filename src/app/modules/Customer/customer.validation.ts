import { z } from 'zod';

export const customerValidationSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  phone: z.string().min(6, 'Customer phone number is required'),
  address: z.string().optional(),
});

export const updateCustomerValidationSchema = customerValidationSchema.partial();

export const CustomerValidation = {
  customerValidationSchema,
  updateCustomerValidationSchema,
};
