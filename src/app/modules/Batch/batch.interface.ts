import { Document, Types } from 'mongoose';

export interface IBatch {
  farmId: Types.ObjectId;
  name: string;
  breed: string;
  type?: 'layer' | 'broiler';
  shed?: string;
  startDate: Date;
  initialCount: number;
  currentCount: number;
  status: 'active' | 'closed';
  lastLogDate?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IBatchDoc extends IBatch, Document {}

export interface IBatchWorker {
  farmId: Types.ObjectId;
  batchId: Types.ObjectId;
  workerId: Types.ObjectId;
  assignedAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IBatchWorkerDoc extends IBatchWorker, Document {}
