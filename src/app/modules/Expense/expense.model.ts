import { Schema, model } from 'mongoose';
import { IExpenseDoc } from './expense.interface';

const expenseSchema = new Schema<IExpenseDoc>({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
  workerId: { type: Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, enum: ['feed', 'medicine', 'labor', 'utility', 'equipment', 'other'], required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'BDT' },
  date: { type: String, required: true },
  note: { type: String },
  receiptUrl: { type: String },
  feedBags: { type: Number, min: 0 },
  feedKg: { type: Number, min: 0 },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

expenseSchema.index({ farmId: 1, date: -1 });
expenseSchema.index({ farmId: 1, batchId: 1, date: -1 });

export const Expense = model<IExpenseDoc>('Expense', expenseSchema);
export const ExpenseModel = Expense;
