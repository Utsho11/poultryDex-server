import { Schema, model } from 'mongoose';
import { IFarmDoc } from './farm.interface';

const farmSchema = new Schema<IFarmDoc>({
  name: { type: String, required: true, trim: true },
  animalType: { type: String, enum: ['poultry', 'layer', 'broiler'], default: 'layer', required: true },
  date: { type: Date },
  location: { type: String, trim: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  timezone: { type: String, default: 'Asia/Dhaka' },
  createdAt: { type: Date, default: Date.now }
});

export const Farm = model<IFarmDoc>('Farm', farmSchema);
export const FarmModel = Farm;
