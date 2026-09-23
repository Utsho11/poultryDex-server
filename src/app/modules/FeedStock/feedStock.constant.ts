export const FEED_CATEGORY = {
  layer_starter: 'layer_starter',
  layer_grower: 'layer_grower',
  layer_layer_1: 'layer_layer_1',
  broiler_starter: 'broiler_starter',
  broiler_grower: 'broiler_grower',
  broiler_finisher: 'broiler_finisher',
} as const;

export type TFeedCategory = keyof typeof FEED_CATEGORY;

export const feedStockSearchableFields = ['category', 'note', 'date'];
