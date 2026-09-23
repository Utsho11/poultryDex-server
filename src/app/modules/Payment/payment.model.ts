import { Schema, model } from 'mongoose';
import { IPaymentDoc } from './payment.interface';

const paymentSchema = new Schema<IPaymentDoc>({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  customerName: { type: String },
  customerPhone: { type: String },
  saleId: { type: Schema.Types.ObjectId, ref: 'Sale' },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: String, required: true },
  method: { type: String, enum: ['cash', 'bkash', 'bank', 'other'], default: 'cash' },
  notes: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

paymentSchema.index({ farmId: 1, customerId: 1, date: -1 });
paymentSchema.index({ farmId: 1, saleId: 1 });

export const Payment = model<IPaymentDoc>('Payment', paymentSchema);
export const PaymentModel = Payment;
