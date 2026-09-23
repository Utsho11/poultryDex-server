import { Document, Types } from 'mongoose';
import { TExpenseCategory } from './expense.constant';

export interface IExpense {
  farmId: Types.ObjectId;
  batchId?: Types.ObjectId;
  workerId?: Types.ObjectId;
  category: TExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  note?: string;
  receiptUrl?: string;
  feedBags?: number;
  feedKg?: number;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

export interface IExpenseDoc extends IExpense, Document {}
