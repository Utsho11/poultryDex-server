import { Document, Types } from 'mongoose';
import { TAnimalType } from './farm.constant';

export interface IFarm {
  name: string;
  animalType: TAnimalType;
  date?: Date;
  location?: string;
  ownerId: Types.ObjectId;
  plan: 'free' | 'pro';
  timezone: string;
  createdAt: Date;
}

export interface IFarmDoc extends IFarm, Document {}
