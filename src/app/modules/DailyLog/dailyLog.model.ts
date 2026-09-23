import { Schema, model } from 'mongoose';
import { IDailyLogDoc } from './dailyLog.interface';

const dailyLogSchema = new Schema<IDailyLogDoc>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    entryId: { type: String, trim: true, index: true },
    date: { type: String, required: true },
    eggCount: { type: Number, default: 0, min: 0 },
    brokenEggCount: { type: Number, default: 0, min: 0 },
    deadCount: { type: Number, default: 0, min: 0 },
    feedGivenKg: { type: Number, default: 0, min: 0 },
    waterGivenLiters: { type: Number, default: 0, min: 0 },
    medicineGiven: [
      {
        name: String,
        dose: String,
        unit: String,
      },
    ],
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordedByName: { type: String, trim: true },
    notes: { type: String },
  },
  { timestamps: true }
);

dailyLogSchema.index({ farmId: 1, batchId: 1, date: -1 }, { unique: true });

export const DailyLog = model<IDailyLogDoc>('DailyLog', dailyLogSchema);
export const DailyLogModel = DailyLog;
