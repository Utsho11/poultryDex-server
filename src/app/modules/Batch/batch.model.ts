import { Schema, model } from 'mongoose';
import { IBatchDoc, IBatchWorkerDoc } from './batch.interface';

const batchSchema = new Schema<IBatchDoc>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    name: { type: String, required: true, trim: true },
    breed: { type: String, required: true },
    type: { type: String, enum: ['layer', 'broiler'] },
    shed: { type: String, trim: true },
    startDate: { type: Date, required: true },
    initialCount: { type: Number, required: true, min: 1 },
    currentCount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active', index: true },
    lastLogDate: { type: String },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

batchSchema.index({ farmId: 1, status: 1 });

export const Batch = model<IBatchDoc>('Batch', batchSchema);
export const BatchModel = Batch;

const batchWorkerSchema = new Schema<IBatchWorkerDoc>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'batch_workers' }
);

batchWorkerSchema.index({ farmId: 1, batchId: 1, workerId: 1 }, { unique: true });
batchWorkerSchema.index({ farmId: 1, workerId: 1 });

export const BatchWorker = model<IBatchWorkerDoc>('BatchWorker', batchWorkerSchema);
export const BatchWorkerModel = BatchWorker;
