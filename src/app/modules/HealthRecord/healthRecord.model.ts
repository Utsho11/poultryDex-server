import { Schema, model } from 'mongoose';
import { IHealthRecordDoc } from './healthRecord.interface';

const healthRecordSchema = new Schema<IHealthRecordDoc>({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
  date: { type: String, required: true },
  type: {
    type: String,
    enum: ['checkup', 'vaccination', 'injection', 'treatment'],
    required: true,
  },
  description: { type: String, required: true },
  medicineUsed: { type: String },
  performedBy: { type: String, required: true },
  cost: { type: Number, default: 0 },
  attachmentUrls: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

healthRecordSchema.index({ farmId: 1, batchId: 1, date: -1 });

export const HealthRecord = model<IHealthRecordDoc>('HealthRecord', healthRecordSchema);
export const HealthRecordModel = HealthRecord;
