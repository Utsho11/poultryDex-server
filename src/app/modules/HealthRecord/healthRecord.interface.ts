import { Document, Types } from 'mongoose';
import { THealthRecordType } from './healthRecord.constant';

export interface IHealthRecord {
  farmId: Types.ObjectId;
  batchId: Types.ObjectId;
  date: string;
  type: THealthRecordType;
  description: string;
  medicineUsed?: string;
  performedBy: string;
  cost?: number;
  attachmentUrls?: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface IHealthRecordDoc extends IHealthRecord, Document {}
