import { Document, Types } from 'mongoose';
import { TFeedCategory } from './feedStock.constant';

export interface IFeedStock {
  farmId: Types.ObjectId;
  category: TFeedCategory;
  bagPrice: number;
  bags: number;
  totalKg: number;
  totalCost: number;
  date: string;
  note?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

export interface IFeedStockDoc extends IFeedStock, Document {}
