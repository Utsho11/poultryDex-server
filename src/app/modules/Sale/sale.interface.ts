import { Document, Types } from 'mongoose';

export interface ISaleItem {
  type: 'egg' | 'chicken';
  quantity: number;
  crates?: number;
  looseEggs?: number;
  birdCount?: number;
  weightKg?: number;
  unit: 'piece' | 'tray' | 'kg' | 'bird';
  unitPrice: number;
  subtotal: number;
}

export interface ISale {
  farmId: Types.ObjectId;
  batchId?: Types.ObjectId;
  customerId?: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  itemType?: 'egg' | 'chicken';
  quantity?: number;
  unitPrice?: number;
  items: ISaleItem[];
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'paid' | 'partial' | 'due';
  date: string;
  notes?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

export interface ISaleDoc extends ISale, Document {}
