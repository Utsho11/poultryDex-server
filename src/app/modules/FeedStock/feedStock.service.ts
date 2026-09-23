import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { FeedStock } from './feedStock.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { feedStockSearchableFields } from './feedStock.constant';

const getFeedStock = async (farmId: string, query: Record<string, unknown> = {}) => {
  const feedStockQuery = new QueryBuilder(
    FeedStock.find({ farmId }).sort({ date: -1 }),
    query
  )
    .search(feedStockSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  return await feedStockQuery.modelQuery;
};

const createFeedStock = async (farmId: string, userId: string, payload: any) => {
  const { category, bagPrice, bags, date, note } = payload;

  const totalKg = bags * 50;
  const totalCost = bags * bagPrice;

  const feedStock = new FeedStock({
    farmId,
    category,
    bagPrice,
    bags,
    totalKg,
    totalCost,
    date,
    note,
    recordedBy: userId,
  });

  await feedStock.save();
  return feedStock;
};

const updateFeedStock = async (id: string, farmId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Feed stock entry not found');
  }

  const existing = await FeedStock.findOne({ _id: id, farmId });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Feed stock entry not found');
  }

  const { category, bagPrice, bags, date, note } = payload;
  if (category !== undefined) existing.category = category;
  if (bagPrice !== undefined) existing.bagPrice = bagPrice;
  if (bags !== undefined) {
    existing.bags = bags;
    existing.totalKg = bags * 50;
  }
  if (existing.bags !== undefined && existing.bagPrice !== undefined) {
    existing.totalCost = existing.bags * existing.bagPrice;
  }
  if (date !== undefined) existing.date = date;
  if (note !== undefined) existing.note = note;

  await existing.save();
  return existing;
};

const deleteFeedStock = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Feed stock entry not found');
  }

  const feedStock = await FeedStock.findOneAndDelete({ _id: id, farmId });
  if (!feedStock) {
    throw new AppError(httpStatus.NOT_FOUND, 'Feed stock entry not found');
  }

  return { message: 'Feed stock entry deleted successfully', id };
};

export const FeedStockServices = {
  getFeedStock,
  createFeedStock,
  updateFeedStock,
  deleteFeedStock,
};
