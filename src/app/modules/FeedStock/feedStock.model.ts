import { Schema, model } from 'mongoose';
import { IFeedStockDoc } from './feedStock.interface';

const feedStockSchema = new Schema<IFeedStockDoc>({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  category: {
    type: String,
    enum: [
      'layer_starter',
      'layer_grower',
      'layer_layer_1',
      'broiler_starter',
      'broiler_grower',
      'broiler_finisher',
    ],
    required: true,
  },
  bagPrice: { type: Number, required: true, min: 0 },
  bags: { type: Number, required: true, min: 0 },
  totalKg: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 },
  date: { type: String, required: true },
  note: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

feedStockSchema.index({ farmId: 1, date: -1 });

export const FeedStock = model<IFeedStockDoc>('FeedStock', feedStockSchema);
export const FeedStockModel = FeedStock;
