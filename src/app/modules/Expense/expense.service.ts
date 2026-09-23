import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Expense } from './expense.model';
import { Batch, BatchWorker } from '../Batch/batch.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { expenseSearchableFields } from './expense.constant';

const getExpenses = async (farmId: string, query: Record<string, unknown>) => {
  const { batchId, category, from, to } = query;
  const filter: any = { farmId };

  if (batchId) {
    let bObjId: any;
    try {
      bObjId = new mongoose.Types.ObjectId(batchId as string);
    } catch {
      bObjId = batchId;
    }
    filter.$and = [{ $or: [{ batchId: bObjId }, { batchId: String(batchId) }] }];
  }
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const expenseQuery = new QueryBuilder(
    Expense.find(filter).populate('workerId', 'name email phone').sort({ date: -1 }),
    query
  )
    .search(expenseSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  return await expenseQuery.modelQuery;
};

const createExpense = async (farmId: string, userId: string, payload: any) => {
  const { batchId, workerId, category, amount, currency, date, note, receiptUrl, feedBags, feedKg } = payload;

  if (batchId) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      throw new AppError(httpStatus.NOT_FOUND, 'Invalid flock/batch ID.');
    }
    const batch = await Batch.findOne({ _id: batchId, farmId });
    if (!batch) {
      throw new AppError(httpStatus.NOT_FOUND, 'Selected flock/batch not found in this firm.');
    }
  }

  if (category === 'labor') {
    if (!batchId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Batch selection is required for labor expenses.');
    }
    const assignedWorkersCount = await BatchWorker.countDocuments({ batchId, farmId });
    if (assignedWorkersCount === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Cannot add labor expense to this batch because no workers are assigned. Please assign a worker first.'
      );
    }
    if (!workerId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Worker selection is required for labor expenses.');
    }
    const isWorkerAssigned = await BatchWorker.exists({ batchId, workerId, farmId });
    if (!isWorkerAssigned) {
      throw new AppError(httpStatus.BAD_REQUEST, 'The selected worker is not assigned to this flock.');
    }
  }

  let computedBags = feedBags !== undefined ? Number(feedBags) : undefined;
  let computedKg = feedKg !== undefined ? Number(feedKg) : undefined;
  if (category === 'feed' && computedBags && !computedKg) {
    computedKg = computedBags * 50;
  }

  const expense = new Expense({
    farmId,
    batchId,
    workerId: category === 'labor' ? workerId : undefined,
    category,
    amount,
    currency: currency || 'BDT',
    date,
    note,
    receiptUrl,
    feedBags: computedBags,
    feedKg: computedKg,
    recordedBy: userId,
  });

  await expense.save();
  return expense;
};

const updateExpense = async (id: string, farmId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Expense record not found');
  }

  const expense = await Expense.findOne({ _id: id, farmId });
  if (!expense) {
    throw new AppError(httpStatus.NOT_FOUND, 'Expense record not found');
  }

  const { batchId, workerId, category, amount, date, note, receiptUrl, feedBags, feedKg } = payload;
  const targetCategory = category !== undefined ? category : expense.category;
  const targetBatchId = batchId !== undefined ? batchId : expense.batchId;

  if (targetBatchId) {
    if (!mongoose.Types.ObjectId.isValid(String(targetBatchId))) {
      throw new AppError(httpStatus.NOT_FOUND, 'Invalid flock/batch ID.');
    }
    const batch = await Batch.findOne({ _id: targetBatchId, farmId });
    if (!batch) {
      throw new AppError(httpStatus.NOT_FOUND, 'Selected flock/batch not found in this firm.');
    }
  }

  if (targetCategory === 'labor') {
    if (!targetBatchId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Batch selection is required for labor expenses.');
    }
    const assignedWorkersCount = await BatchWorker.countDocuments({ batchId: targetBatchId, farmId });
    if (assignedWorkersCount === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Cannot assign labor expense to a batch without assigned workers.');
    }
    const targetWorkerId = workerId !== undefined ? workerId : expense.workerId;
    if (targetWorkerId) {
      const isWorkerAssigned = await BatchWorker.exists({ batchId: targetBatchId, workerId: targetWorkerId, farmId });
      if (!isWorkerAssigned) {
        throw new AppError(httpStatus.BAD_REQUEST, 'The selected worker is not assigned to this flock.');
      }
    }
  }

  if (batchId !== undefined) expense.batchId = batchId as any;
  if (workerId !== undefined) expense.workerId = workerId as any;
  if (category !== undefined) expense.category = category as any;
  if (amount !== undefined) expense.amount = Number(amount);
  if (date !== undefined) expense.date = date;
  if (note !== undefined) expense.note = note;
  if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
  if (feedBags !== undefined) {
    expense.feedBags = Number(feedBags);
    if (feedKg === undefined) {
      expense.feedKg = Number(feedBags) * 50;
    }
  }
  if (feedKg !== undefined) expense.feedKg = Number(feedKg);

  await expense.save();
  return expense;
};

const deleteExpense = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Expense record not found');
  }

  const expense = await Expense.findOneAndDelete({ _id: id, farmId });
  if (!expense) {
    throw new AppError(httpStatus.NOT_FOUND, 'Expense record not found');
  }

  return { message: 'Expense deleted successfully', id };
};

export const ExpenseServices = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
