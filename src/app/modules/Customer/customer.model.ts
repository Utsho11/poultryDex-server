import { Schema, model } from 'mongoose';
import { ICustomerDoc } from './customer.interface';

const customerSchema = new Schema<ICustomerDoc>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    totalDue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ farmId: 1, phone: 1 }, { unique: true });

export const Customer = model<ICustomerDoc>('Customer', customerSchema);
export const CustomerModel = Customer;
