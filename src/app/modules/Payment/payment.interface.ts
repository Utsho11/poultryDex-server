import { Document, Types } from 'mongoose';
import { PAYMENT_METHOD } from './payment.constant';

export type TPaymentMethod = keyof typeof PAYMENT_METHOD;

export interface IPayment {
  farmId: Types.ObjectId;
  customerId: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  saleId?: Types.ObjectId;
  amount: number;
  date: string;
  method: TPaymentMethod;
  notes?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

export interface IPaymentDoc extends IPayment, Document {}
