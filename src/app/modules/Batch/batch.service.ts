import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Batch, BatchWorker } from './batch.model';
import { Farm } from '../Farm/farm.model';
import { User } from '../User/user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { batchSearchableFields } from './batch.constant';

const createBatch = async (farmId: string, payload: any) => {
  const { name, breed, type, shed, startDate, initialCount, assignedWorkerIds } = payload;

  const firm = await Farm.findById(farmId);
  const batchType = type || (firm?.animalType === 'broiler' ? 'broiler' : 'layer');

  const batch = new Batch({
    farmId,
    name,
    breed,
    type: batchType,
    shed,
    startDate: new Date(startDate),
    initialCount,
    currentCount: initialCount,
    status: 'active',
  });

  await batch.save();

  if (assignedWorkerIds && Array.isArray(assignedWorkerIds) && assignedWorkerIds.length > 0) {
    const validWorkerIds = assignedWorkerIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validWorkerIds.length > 0) {
      const farmWorkers = await User.find({ _id: { $in: validWorkerIds }, farmId }).select('_id');
      const verifiedWorkerIds = farmWorkers.map(w => w._id);
      if (verifiedWorkerIds.length > 0) {
        await BatchWorker.insertMany(
          verifiedWorkerIds.map(wId => ({
            farmId,
            batchId: batch._id,
            workerId: wId,
          })),
          { ordered: false }
        );
      }
    }
  }

  const assignments = await BatchWorker.find({ batchId: batch._id, farmId })
    .populate('workerId', 'name email phone role');
  const batchObj: any = batch.toObject();
  const workers = assignments.map(a => a.workerId).filter(Boolean);
  batchObj.assignedWorkers = workers;
  batchObj.assignedWorkerIds = workers.map((w: any) => String(w._id || w));

  return batchObj;
};

const getBatches = async (farmId: string, query: Record<string, unknown>) => {
  const batchQuery = new QueryBuilder(
    Batch.find({ farmId }),
    query
  )
    .search(batchSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const batches = await batchQuery.modelQuery;
  const batchIds = batches.map(b => b._id);

  const assignments = await BatchWorker.find({ batchId: { $in: batchIds }, farmId })
    .populate('workerId', 'name email phone role');

  const assignmentsByBatch = new Map<string, any[]>();
  assignments.forEach(a => {
    const bIdStr = String(a.batchId);
    if (!assignmentsByBatch.has(bIdStr)) {
      assignmentsByBatch.set(bIdStr, []);
    }
    if (a.workerId) {
      assignmentsByBatch.get(bIdStr)!.push(a.workerId);
    }
  });

  return batches.map(b => {
    const bObj: any = b.toObject();
    const workers = assignmentsByBatch.get(String(b._id)) || [];
    bObj.assignedWorkers = workers;
    bObj.assignedWorkerIds = workers.map((w: any) => String(w._id || w));
    return bObj;
  });
};

const getBatchById = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  const batch = await Batch.findOne({ _id: id, farmId });
  if (!batch) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  const assignments = await BatchWorker.find({ batchId: batch._id, farmId })
    .populate('workerId', 'name email phone role');
  const batchObj: any = batch.toObject();
  const workers = assignments.map(a => a.workerId).filter(Boolean);
  batchObj.assignedWorkers = workers;
  batchObj.assignedWorkerIds = workers.map((w: any) => String(w._id || w));

  return batchObj;
};

const updateBatch = async (id: string, farmId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  const { name, breed, type, shed, startDate, initialCount, currentCount, status } = payload;
  const workerIdsInput = payload.assignedWorkerIds !== undefined ? payload.assignedWorkerIds : payload.workerIds;

  const batch = await Batch.findOne({ _id: id, farmId });
  if (!batch) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  if (name !== undefined) batch.name = name;
  if (breed !== undefined) batch.breed = breed;
  if (type !== undefined) batch.type = type;
  if (shed !== undefined) batch.shed = shed;
  if (startDate !== undefined) batch.startDate = new Date(startDate);
  if (initialCount !== undefined) batch.initialCount = Number(initialCount);
  if (currentCount !== undefined) batch.currentCount = Number(currentCount);
  if (status !== undefined) {
    batch.status = status;
    if (status === 'closed') batch.closedAt = new Date();
  }

  await batch.save();

  if (workerIdsInput !== undefined && Array.isArray(workerIdsInput)) {
    await BatchWorker.deleteMany({ batchId: batch._id, farmId });
    const validWorkerIds = workerIdsInput.filter((wId: string) => mongoose.Types.ObjectId.isValid(wId));
    if (validWorkerIds.length > 0) {
      const farmWorkers = await User.find({ _id: { $in: validWorkerIds }, farmId }).select('_id');
      const verifiedWorkerIds = farmWorkers.map(w => w._id);
      if (verifiedWorkerIds.length > 0) {
        await BatchWorker.insertMany(
          verifiedWorkerIds.map(wId => ({
            farmId,
            batchId: batch._id,
            workerId: wId,
          })),
          { ordered: false }
        );
      }
    }
  }

  const assignments = await BatchWorker.find({ batchId: batch._id, farmId })
    .populate('workerId', 'name email phone role');
  const batchObj: any = batch.toObject();
  const workers = assignments.map(a => a.workerId).filter(Boolean);
  batchObj.assignedWorkers = workers;
  batchObj.assignedWorkerIds = workers.map((w: any) => String(w._id || w));

  return batchObj;
};

const assignWorkers = async (id: string, farmId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  const batch = await Batch.findOne({ _id: id, farmId });
  if (!batch) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  const workerIds = payload.workerIds !== undefined ? payload.workerIds : payload.assignedWorkerIds;
  if (workerIds !== undefined && Array.isArray(workerIds)) {
    await BatchWorker.deleteMany({ batchId: batch._id, farmId });
    const validWorkerIds = workerIds.filter((wId: string) => mongoose.Types.ObjectId.isValid(wId));
    if (validWorkerIds.length > 0) {
      const farmWorkers = await User.find({ _id: { $in: validWorkerIds }, farmId }).select('_id');
      const verifiedWorkerIds = farmWorkers.map(w => w._id);
      if (verifiedWorkerIds.length > 0) {
        await BatchWorker.insertMany(
          verifiedWorkerIds.map(wId => ({
            farmId,
            batchId: batch._id,
            workerId: wId,
          })),
          { ordered: false }
        );
      }
    }
  }

  const assignments = await BatchWorker.find({ batchId: batch._id, farmId })
    .populate('workerId', 'name email phone role');
  const batchObj: any = batch.toObject();
  const workers = assignments.map(a => a.workerId).filter(Boolean);
  batchObj.assignedWorkers = workers;
  batchObj.assignedWorkerIds = workers.map((w: any) => String(w._id || w));

  return batchObj;
};

const closeBatch = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  const batch = await Batch.findOne({ _id: id, farmId });
  if (!batch) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  batch.status = 'closed';
  batch.closedAt = new Date();
  await batch.save();

  return batch;
};

const deleteBatch = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  const batch = await Batch.findOne({ _id: id, farmId });
  if (!batch) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flock/Batch not found');
  }

  const collections = mongoose.connection.collections;
  await Promise.all([
    collections['dailylogs']?.deleteMany({ batchId: id, farmId }),
    collections['healthrecords']?.deleteMany({ batchId: id, farmId }),
    collections['reminders']?.deleteMany({ batchId: id, farmId }),
    collections['batch_workers']?.deleteMany({ batchId: id, farmId }),
    collections['expenses']?.updateMany({ batchId: id, farmId }, { $unset: { batchId: 1 } }),
    collections['sales']?.updateMany({ batchId: id, farmId }, { $unset: { batchId: 1 } }),
    Batch.deleteOne({ _id: id, farmId }),
  ]);

  return { message: 'Flock/Batch and associated records deleted successfully' };
};

export const BatchServices = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  assignWorkers,
  closeBatch,
  deleteBatch,
};
