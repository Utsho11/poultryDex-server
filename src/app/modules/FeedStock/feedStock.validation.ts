import { z } from 'zod';

export const feedCategoryEnum = z.enum([
  'layer_starter',
  'layer_grower',
  'layer_layer_1',
  'broiler_starter',
  'broiler_grower',
  'broiler_finisher',
]);

export const feedStockValidationSchema = z.object({
  category: feedCategoryEnum,
  bagPrice: z.coerce.number().positive('Bag price must be greater than 0'),
  bags: z.coerce.number().positive('Number of bags must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  note: z.string().optional(),
});

export const updateFeedStockValidationSchema = feedStockValidationSchema.partial();

export const FeedStockValidation = {
  feedStockValidationSchema,
  updateFeedStockValidationSchema,
};
