import { Document, Types } from 'mongoose';
import { TReminderType } from './reminder.constant';

export interface IReminder {
  farmId: Types.ObjectId;
  batchId?: Types.ObjectId;
  type: TReminderType;
  message: string;
  cronExpression: string;
  assignedTo: Types.ObjectId[];
  channel: ('push' | 'sms')[];
  active: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReminderDoc extends IReminder, Document {}
