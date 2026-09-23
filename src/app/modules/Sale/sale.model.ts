import { Schema, model } from 'mongoose';
import { ISaleDoc, ISaleItem } from './sale.interface';

const saleItemSchema = new Schema<ISaleItem>(
  {
    type: { type: String, enum: ['egg', 'chicken'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    crates: { type: Number, min: 0 },
    looseEggs: { type: Number, min: 0 },
    birdCount: { type: Number, min: 0 },
    weightKg: { type: Number, min: 0 },
    unit: { type: String, enum: ['piece', 'tray', 'kg', 'bird'], default: 'piece' },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new Schema<ISaleDoc>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    customerPhone: { type: String },
    itemType: { type: String, enum: ['egg', 'chicken'] },
    quantity: { type: Number },
    unitPrice: { type: Number },
    items: [saleItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    amountDue: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['paid', 'partial', 'due'], default: 'paid' },
    date: { type: String, required: true },
    notes: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

saleSchema.index({ farmId: 1, date: -1 });
saleSchema.index({ farmId: 1, customerId: 1, date: -1 });
saleSchema.index({ farmId: 1, batchId: 1, date: -1 });

export const Sale = model<ISaleDoc>('Sale', saleSchema);
export const SaleModel = Sale;
