import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { HealthRecord } from './healthRecord.model';
import { Batch } from '../Batch/batch.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { healthRecordSearchableFields } from './healthRecord.constant';

const getHealthRecords = async (farmId: string, query: Record<string, unknown>) => {
  const { batchId } = query;
  const filter: any = { farmId };

  if (batchId) {
    if (!mongoose.Types.ObjectId.isValid(batchId as string)) {
      return [];
    }
    filter.batchId = batchId;
  }

  const healthQuery = new QueryBuilder(
    HealthRecord.find(filter).sort({ date: -1 }),
    query
  )
    .search(healthRecordSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  return await healthQuery.modelQuery;
};

const createHealthRecord = async (farmId: string, userId: string, payload: any) => {
  const { batchId, date, type, description, medicineUsed, performedBy, cost, attachmentUrls } = payload;

  if (batchId) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      throw new AppError(httpStatus.NOT_FOUND, 'Invalid flock/batch ID');
    }
    const batch = await Batch.findOne({ _id: batchId, farmId });
    if (!batch) {
      throw new AppError(httpStatus.NOT_FOUND, 'Selected flock/batch not found in this firm');
    }
  }

  const record = new HealthRecord({
    farmId,
    batchId,
    date,
    type,
    description,
    medicineUsed,
    performedBy,
    cost,
    attachmentUrls,
    createdBy: userId,
  });

  await record.save();
  return record;
};

const updateHealthRecord = async (id: string, farmId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Health record not found');
  }

  const record = await HealthRecord.findOne({ _id: id, farmId });
  if (!record) {
    throw new AppError(httpStatus.NOT_FOUND, 'Health record not found');
  }

  const { batchId, date, type, description, medicineUsed, performedBy, cost, attachmentUrls } = payload;

  if (batchId !== undefined) {
    if (batchId) {
      if (!mongoose.Types.ObjectId.isValid(batchId)) {
        throw new AppError(httpStatus.NOT_FOUND, 'Invalid flock/batch ID');
      }
      const batch = await Batch.findOne({ _id: batchId, farmId });
      if (!batch) {
        throw new AppError(httpStatus.NOT_FOUND, 'Selected flock/batch not found in this firm');
      }
    }
    record.batchId = batchId as any;
  }
  if (date !== undefined) record.date = date;
  if (type !== undefined) record.type = type;
  if (description !== undefined) record.description = description;
  if (medicineUsed !== undefined) record.medicineUsed = medicineUsed;
  if (performedBy !== undefined) record.performedBy = performedBy;
  if (cost !== undefined) record.cost = cost;
  if (attachmentUrls !== undefined) record.attachmentUrls = attachmentUrls;

  await record.save();
  return record;
};

const deleteHealthRecord = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Health record not found');
  }

  const record = await HealthRecord.findOneAndDelete({ _id: id, farmId });
  if (!record) {
    throw new AppError(httpStatus.NOT_FOUND, 'Health record not found');
  }

  return { message: 'Health record deleted successfully', id };
};

export const HealthRecordServices = {
  getHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
};
