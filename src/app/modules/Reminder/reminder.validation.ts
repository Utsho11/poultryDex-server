import { z } from 'zod';

export const reminderValidationSchema = z.object({
  batchId: z.string().optional(),
  type: z.enum(['feed', 'water', 'medicine', 'custom']),
  message: z.string().min(1, 'Message is required'),
  cronExpression: z.string().min(1, 'Cron expression is required'),
  assignedTo: z.array(z.string()).optional(),
  channel: z.array(z.enum(['push', 'sms'])).default(['push']),
  active: z.boolean().default(true),
});

export const updateReminderValidationSchema = reminderValidationSchema.partial();

export const ReminderValidation = {
  reminderValidationSchema,
  updateReminderValidationSchema,
};
