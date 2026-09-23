import { Schema, model } from 'mongoose';
import { IReminderDoc } from './reminder.interface';

const reminderSchema = new Schema<IReminderDoc>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    type: { type: String, enum: ['feed', 'water', 'medicine', 'custom'], required: true },
    message: { type: String, required: true },
    cronExpression: { type: String, required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    channel: [{ type: String, enum: ['push', 'sms'], default: 'push' }],
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

reminderSchema.index({ farmId: 1, active: 1 });

export const Reminder = model<IReminderDoc>('Reminder', reminderSchema);
export const ReminderModel = Reminder;
