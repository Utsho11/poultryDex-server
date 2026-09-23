import { Document, Types } from 'mongoose';

export interface ICustomer {
  farmId: Types.ObjectId;
  name: string;
  phone: string;
  address?: string;
  totalDue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerDoc extends ICustomer, Document {}
