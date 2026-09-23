import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { DailyLog } from './dailyLog.model';
import { Batch } from '../Batch/batch.model';

const getLogs = async (farmId: string, query: Record<string, unknown>) => {
  const { batchId, from, to, page, limit } = query;
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
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from as string;
    if (to) filter.date.$lte = to as string;
  }

  let logQuery = DailyLog.find(filter)
    .sort({ date: -1 })
    .populate('recordedBy', 'name role')
    .populate('batchId', 'name breed type');

  if (limit) {
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    logQuery = logQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
  }

  return await logQuery;
};

const createLog = async (farmId: string, userId: string, payload: any) => {
  const {
    batchId,
    date,
    eggCount,
    brokenEggCount,
    deadCount,
    feedGivenKg,
    waterGivenLiters,
    medicineGiven,
    notes,
  } = payload;

  const batch = await Batch.findOne({ _id: batchId, farmId });
  if (!batch) {
    throw new AppError(httpStatus.NOT_FOUND, 'Selected flock/batch not found');
  }

  const batchStartDateStr = new Date(batch.startDate).toISOString().split('T')[0];
  if (date < batchStartDateStr) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Log date (${date}) cannot be earlier than flock start date (${batchStartDateStr})`
    );
  }

  const existingLog = await DailyLog.findOne({ farmId, batchId, date });
  if (existingLog) {
    throw new AppError(
      httpStatus.CONFLICT,
      `A daily log entry already exists for batch '${batch.name}' on ${date}`
    );
  }

  if (feedGivenKg > 0) {
    const collections = mongoose.connection.collections;
    const [feedStockDocs, feedExpenseDocs, loggedFeedAgg] = await Promise.all([
      collections['feedstocks']
        ? collections['feedstocks']
            .aggregate([
              { $match: { farmId: new mongoose.Types.ObjectId(farmId) } },
              { $group: { _id: null, totalKg: { $sum: '$totalKg' } } },
            ])
            .toArray()
        : [],
      collections['expenses']
        ? collections['expenses']
            .aggregate([
              { $match: { farmId: new mongoose.Types.ObjectId(farmId), category: 'feed' } },
              {
                $group: {
                  _id: null,
                  totalKg: { $sum: { $ifNull: ['$feedKg', { $multiply: ['$feedBags', 50] }] } },
                },
              },
            ])
            .toArray()
        : [],
      DailyLog.aggregate([
        { $match: { farmId: new mongoose.Types.ObjectId(farmId) } },
        { $group: { _id: null, sum: { $sum: '$feedGivenKg' } } },
      ]),
    ]);

    const totalStockKg = (feedStockDocs[0]?.totalKg || 0) + (feedExpenseDocs[0]?.totalKg || 0);
    const totalUsedKg = loggedFeedAgg[0]?.sum || 0;
    const availableStockKg = Math.max(0, totalStockKg - totalUsedKg);

    if (feedGivenKg > availableStockKg) {
      const availBags = (availableStockKg / 50).toFixed(1);
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Invalid Feed Amount! You entered ${feedGivenKg} kg feed, but available Store Feed Stock is only ${availableStockKg.toLocaleString()} kg (${availBags} Bags). Please add feed stock first.`
      );
    }
  }

  const log = new DailyLog({
    farmId,
    batchId,
    date,
    eggCount,
    brokenEggCount,
    deadCount,
    feedGivenKg,
    waterGivenLiters,
    medicineGiven,
    recordedBy: userId,
    notes,
  });

  await log.save();

  if (deadCount > 0) {
    await Batch.updateOne(
      { _id: batchId, farmId },
      { $inc: { currentCount: -deadCount } }
    );
  }

  if (!batch.lastLogDate || date > batch.lastLogDate) {
    await Batch.updateOne(
      { _id: batchId, farmId },
      { $set: { lastLogDate: date } }
    );
  }

  return log;
};

const updateLog = async (id: string, farmId: string, userRole: string, payload: any) => {
  const log = await DailyLog.findOne({ _id: id, farmId });
  if (!log) {
    throw new AppError(httpStatus.NOT_FOUND, 'Daily log record not found');
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (userRole === 'worker' && log.date !== todayStr) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Workers can only edit daily logs on the day of entry. Please ask a manager or owner.'
    );
  }

  const oldDead = log.deadCount || 0;
  const { date, eggCount, brokenEggCount, deadCount, feedGivenKg, waterGivenLiters, medicineGiven, notes } = payload;

  if (date && date !== log.date && log.batchId) {
    const batch = await Batch.findOne({ _id: log.batchId, farmId });
    if (batch && batch.startDate) {
      const batchStartDateStr = new Date(batch.startDate).toISOString().split('T')[0];
      if (date < batchStartDateStr) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Log date (${date}) cannot be earlier than flock start date (${batchStartDateStr})`
        );
      }
    }
    log.date = date;
  }

  if (feedGivenKg !== undefined && feedGivenKg > 0) {
    const collections = mongoose.connection.collections;
    const [feedStockDocs, feedExpenseDocs, loggedFeedAgg] = await Promise.all([
      collections['feedstocks']
        ? collections['feedstocks']
            .aggregate([
              { $match: { farmId: new mongoose.Types.ObjectId(farmId) } },
              { $group: { _id: null, totalKg: { $sum: '$totalKg' } } },
            ])
            .toArray()
        : [],
      collections['expenses']
        ? collections['expenses']
            .aggregate([
              { $match: { farmId: new mongoose.Types.ObjectId(farmId), category: 'feed' } },
              {
                $group: {
                  _id: null,
                  totalKg: { $sum: { $ifNull: ['$feedKg', { $multiply: ['$feedBags', 50] }] } },
                },
              },
            ])
            .toArray()
        : [],
      DailyLog.aggregate([
        { $match: { farmId: new mongoose.Types.ObjectId(farmId), _id: { $ne: log._id } } },
        { $group: { _id: null, sum: { $sum: '$feedGivenKg' } } },
      ]),
    ]);

    const totalStockKg = (feedStockDocs[0]?.totalKg || 0) + (feedExpenseDocs[0]?.totalKg || 0);
    const otherUsedKg = loggedFeedAgg[0]?.sum || 0;
    const availableStockKg = Math.max(0, totalStockKg - otherUsedKg);

    if (feedGivenKg > availableStockKg) {
      const availBags = (availableStockKg / 50).toFixed(1);
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Invalid Feed Amount! You entered ${feedGivenKg} kg feed, but available Store Feed Stock is only ${availableStockKg.toLocaleString()} kg (${availBags} Bags).`
      );
    }
  }

  const newDead = deadCount !== undefined ? Number(deadCount) : oldDead;
  const deadDiff = newDead - oldDead;

  if (deadDiff !== 0 && log.batchId) {
    await Batch.updateOne(
      { _id: log.batchId, farmId },
      { $inc: { currentCount: -deadDiff } }
    );
  }

  if (eggCount !== undefined) log.eggCount = Number(eggCount);
  if (brokenEggCount !== undefined) log.brokenEggCount = Number(brokenEggCount);
  if (deadCount !== undefined) log.deadCount = Number(deadCount);
  if (feedGivenKg !== undefined) log.feedGivenKg = Number(feedGivenKg);
  if (waterGivenLiters !== undefined) log.waterGivenLiters = Number(waterGivenLiters);
  if (medicineGiven !== undefined) log.medicineGiven = medicineGiven;
  if (notes !== undefined) log.notes = notes;

  await log.save();
  return log;
};

const deleteLog = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Daily log record not found');
  }

  const log = await DailyLog.findOne({ _id: id, farmId });
  if (!log) {
    throw new AppError(httpStatus.NOT_FOUND, 'Daily log record not found');
  }

  await DailyLog.deleteOne({ _id: id, farmId });

  if (log.batchId) {
    if (log.deadCount > 0) {
      await Batch.updateOne(
        { _id: log.batchId, farmId },
        { $inc: { currentCount: log.deadCount } }
      );
    }
    const latestLog = await DailyLog.findOne({ farmId, batchId: log.batchId }).sort({ date: -1 });
    await Batch.updateOne(
      { _id: log.batchId, farmId },
      { $set: { lastLogDate: latestLog?.date || undefined } }
    );
  }

  return { message: 'Daily log entry deleted successfully', id };
};

export const DailyLogServices = {
  getLogs,
  createLog,
  updateLog,
  deleteLog,
};
