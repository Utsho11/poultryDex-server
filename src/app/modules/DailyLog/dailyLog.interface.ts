import { Document, Types } from 'mongoose';

export interface IDailyLog {
  farmId: Types.ObjectId;
  batchId: Types.ObjectId;
  entryId?: string;
  date: string;
  eggCount: number;
  brokenEggCount: number;
  deadCount: number;
  feedGivenKg: number;
  waterGivenLiters: number;
  medicineGiven?: { name: string; dose: string; unit: string }[];
  recordedBy: Types.ObjectId;
  recordedByName?: string;
  notes?: string;
  createdAt: Date;
}

export interface IDailyLogDoc extends IDailyLog, Document {}
