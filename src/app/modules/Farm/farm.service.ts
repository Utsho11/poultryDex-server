import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken } from '../../utils/verifyJWT';
import { Farm } from './farm.model';
import { User } from '../User/user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { farmSearchableFields } from './farm.constant';

const createFarm = async (userId: string, payload: any) => {
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User context missing');
  }

  const { name, animalType, date, location, timezone } = payload;

  const farm = new Farm({
    name,
    animalType,
    date: date ? new Date(date) : new Date(),
    location,
    ownerId: userId,
    timezone: timezone || 'Asia/Dhaka',
    plan: 'pro',
  });

  await farm.save();

  const user = await User.findById(userId);
  if (user) {
    user.activeFarmId = farm._id as any;
    if (!user.farmId) user.farmId = farm._id as any;
    await user.save();
  }

  const token = createToken(
    {
      userId,
      farmId: (farm._id as any).toString(),
      role: user?.role || 'owner',
      email: user?.email || '',
      name: user?.name || '',
    },
    config.jwt_access_secret,
    config.jwt_access_expires_in
  );

  return {
    _id: farm._id,
    farm,
    accessToken: token,
    user: {
      userId,
      farmId: (farm._id as any).toString(),
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      role: user?.role,
      farmName: farm.name,
      animalType: farm.animalType,
    },
  };
};

const getFarms = async (userId: string, tokenFarmId?: string, query: Record<string, unknown> = {}) => {
  const orConditions: any[] = [];
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    orConditions.push({ ownerId: userId });
  }
  if (tokenFarmId && mongoose.Types.ObjectId.isValid(tokenFarmId)) {
    orConditions.push({ _id: tokenFarmId });
  }

  if (orConditions.length === 0) {
    return [];
  }

  const farmQuery = new QueryBuilder(
    Farm.find({ $or: orConditions }),
    query
  )
    .search(farmSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await farmQuery.modelQuery;
  return result;
};

const getFarmById = async (farmId: string, userId: string, tokenFarmId?: string) => {
  if (!mongoose.Types.ObjectId.isValid(farmId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Firm not found');
  }

  const farm = await Farm.findById(farmId);
  if (!farm) {
    throw new AppError(httpStatus.NOT_FOUND, 'Firm not found');
  }

  const isOwner = farm.ownerId && farm.ownerId.toString() === userId;
  const isMember = tokenFarmId && tokenFarmId.toString() === farm._id.toString();
  if (!isOwner && !isMember) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have access to this firm');
  }

  return farm;
};

const updateFarm = async (farmId: string, userId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(farmId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Firm not found');
  }

  const farm = await Farm.findById(farmId);
  if (!farm) {
    throw new AppError(httpStatus.NOT_FOUND, 'Firm not found');
  }

  const isOwner = farm.ownerId && farm.ownerId.toString() === userId;
  if (!isOwner) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only the firm owner can update firm details');
  }

  const { name, animalType, date, location } = payload;
  if (name !== undefined) farm.name = name;
  if (animalType !== undefined) farm.animalType = animalType;
  if (date !== undefined) farm.date = new Date(date);
  if (location !== undefined) farm.location = location;

  await farm.save();
  return farm;
};

const deleteFarm = async (farmId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(farmId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Firm not found');
  }

  const farm = await Farm.findById(farmId);
  if (!farm) {
    throw new AppError(httpStatus.NOT_FOUND, 'Firm not found');
  }

  if (farm.ownerId.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only the firm owner can delete this firm');
  }

  // Dynamic model resolution to avoid circular dependencies
  const collections = mongoose.connection.collections;
  await Promise.all([
    collections['batches']?.deleteMany({ farmId }),
    collections['batch_workers']?.deleteMany({ farmId }),
    collections['reminders']?.deleteMany({ farmId }),
    collections['dailylogs']?.deleteMany({ farmId }),
    collections['expenses']?.deleteMany({ farmId }),
    collections['sales']?.deleteMany({ farmId }),
    collections['feedstocks']?.deleteMany({ farmId }),
    collections['customers']?.deleteMany({ farmId }),
    collections['payments']?.deleteMany({ farmId }),
    collections['healthrecords']?.deleteMany({ farmId }),
    User.updateMany({ activeFarmId: farmId }, { $unset: { activeFarmId: 1 } }),
    User.updateMany({ farmId: farmId }, { $unset: { farmId: 1 } }),
    Farm.deleteOne({ _id: farmId }),
  ]);

  return { message: 'Firm and all associated data deleted successfully' };
};

export const FarmServices = {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
};
