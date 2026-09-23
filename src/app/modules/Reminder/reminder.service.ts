import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Reminder } from './reminder.model';
import { Batch } from '../Batch/batch.model';
import { User } from '../User/user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { reminderSearchableFields } from './reminder.constant';

const getReminders = async (farmId: string, query: Record<string, unknown>) => {
  const reminderQuery = new QueryBuilder(
    Reminder.find({ farmId })
      .populate('batchId', 'name breed')
      .populate('assignedTo', 'name email phone role')
      .sort({ createdAt: -1 }),
    query
  )
    .search(reminderSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  return await reminderQuery.modelQuery;
};

const createReminder = async (farmId: string, userId: string, payload: any) => {
  const { batchId, type, message, cronExpression, assignedTo, channel, active } = payload;

  if (batchId) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      throw new AppError(httpStatus.NOT_FOUND, 'Selected batch not found');
    }
    const batch = await Batch.findOne({ _id: batchId, farmId });
    if (!batch) {
      throw new AppError(httpStatus.NOT_FOUND, 'Selected batch not found');
    }
  }

  let verifiedAssignedTo: any[] = [];
  if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
    const validUserIds = assignedTo.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validUserIds.length > 0) {
      const farmUsers = await User.find({ _id: { $in: validUserIds }, farmId }).select('_id');
      verifiedAssignedTo = farmUsers.map(u => u._id);
    }
  }

  const reminder = new Reminder({
    farmId,
    batchId: batchId || undefined,
    type,
    message,
    cronExpression,
    assignedTo: verifiedAssignedTo,
    channel: channel || ['push'],
    active: active !== undefined ? active : true,
    createdBy: userId,
  });

  await reminder.save();
  return reminder;
};

const updateReminder = async (id: string, farmId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reminder not found');
  }

  const reminder = await Reminder.findOne({ _id: id, farmId });
  if (!reminder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reminder not found');
  }

  const { batchId, type, message, cronExpression, assignedTo, channel, active } = payload;

  if (batchId !== undefined) {
    if (batchId) {
      if (!mongoose.Types.ObjectId.isValid(batchId)) {
        throw new AppError(httpStatus.NOT_FOUND, 'Selected batch not found');
      }
      const batch = await Batch.findOne({ _id: batchId, farmId });
      if (!batch) {
        throw new AppError(httpStatus.NOT_FOUND, 'Selected batch not found');
      }
    }
    reminder.batchId = (batchId || undefined) as any;
  }
  if (type !== undefined) reminder.type = type;
  if (message !== undefined) reminder.message = message;
  if (cronExpression !== undefined) reminder.cronExpression = cronExpression;
  if (assignedTo !== undefined) {
    if (Array.isArray(assignedTo)) {
      const validUserIds = assignedTo.filter(uId => mongoose.Types.ObjectId.isValid(uId));
      const farmUsers = await User.find({ _id: { $in: validUserIds }, farmId }).select('_id');
      reminder.assignedTo = farmUsers.map(u => u._id) as any;
    } else {
      reminder.assignedTo = [];
    }
  }
  if (channel !== undefined) reminder.channel = channel;
  if (active !== undefined) reminder.active = active;

  await reminder.save();
  return reminder;
};

const deleteReminder = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reminder not found');
  }

  const reminder = await Reminder.findOne({ _id: id, farmId });
  if (!reminder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reminder not found');
  }

  await Reminder.deleteOne({ _id: id, farmId });
  return { message: 'Reminder deleted successfully', id };
};

export const ReminderServices = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
};
