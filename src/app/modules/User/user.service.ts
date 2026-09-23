import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import config from '../../config';
import { User } from './user.model';
import { BatchWorker } from '../Batch/batch.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { userSearchableFields } from './user.constant';

const getUsersByFarm = async (farmId: string, query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(
    User.find({ farmId }).select('-passwordHash'),
    query
  )
    .search(userSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  return result;
};

const createUser = async (farmId: string, payload: any) => {
  const { name, email, password, role, phone } = payload;

  const trimmedEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
  const trimmedPhone = phone && phone.trim() ? phone.trim() : undefined;

  if (trimmedEmail) {
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      throw new AppError(httpStatus.BAD_REQUEST, 'An account with this email address already exists');
    }
  }

  if (trimmedPhone) {
    const existingPhone = await User.findOne({ phone: trimmedPhone });
    if (existingPhone) {
      throw new AppError(httpStatus.BAD_REQUEST, 'An account with this phone number already exists');
    }
  }

  const passwordHash = await bcrypt.hash(password, config.bcrypt_salt_rounds);

  const user = new User({
    farmId,
    name,
    email: trimmedEmail,
    passwordHash,
    role,
    phone: trimmedPhone,
    isActive: true,
  });

  await user.save();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
  };
};

const updateOwnProfile = async (userId: string, payload: any) => {
  const { name, email, phone } = payload;
  const updateData: any = {};
  if (name && name.trim()) updateData.name = name.trim();
  if (email && email.trim()) updateData.email = email.trim().toLowerCase();
  if (phone && phone.trim()) updateData.phone = phone.trim();

  if (Object.keys(updateData).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No fields to update');
  }

  if (updateData.email) {
    const existingEmail = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
    if (existingEmail) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Email is already in use by another account');
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-passwordHash');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

const changeOwnPassword = async (userId: string, payload: any) => {
  const { currentPassword, newPassword } = payload;
  if (!currentPassword || !newPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Current password and new password are required');
  }
  if (newPassword.length < 6) {
    throw new AppError(httpStatus.BAD_REQUEST, 'New password must be at least 6 characters');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(newPassword, config.bcrypt_salt_rounds);
  await user.save();

  return { message: 'Password changed successfully' };
};

const toggleUserActive = async (userId: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const user = await User.findOne({ _id: userId, farmId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.isActive = !user.isActive;
  await user.save();
  return { _id: user._id, isActive: user.isActive };
};

const updateUserRole = async (userId: string, farmId: string, role: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!role || !['manager', 'worker'].includes(role)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Role must be either manager or worker');
  }

  const user = await User.findOne({ _id: userId, farmId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found in this farm');
  }

  user.role = role as any;
  await user.save();
  return { _id: user._id, name: user.name, role: user.role };
};

const updateUser = async (userId: string, farmId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { name, role, phone, isActive } = payload;
  const user = await User.findOne({ _id: userId, farmId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (name !== undefined && name.trim()) user.name = name.trim();
  if (role !== undefined && ['manager', 'worker'].includes(role)) user.role = role;
  if (phone !== undefined) user.phone = phone && phone.trim() ? phone.trim() : undefined;
  if (isActive !== undefined) user.isActive = Boolean(isActive);

  await user.save();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
  };
};

const deleteUser = async (userIdToDelete: string, farmId: string, currentUserId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (userIdToDelete === currentUserId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Owner cannot delete their own account');
  }

  const user = await User.findOne({ _id: userIdToDelete, farmId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await BatchWorker.deleteMany({ workerId: userIdToDelete, farmId });
  await User.deleteOne({ _id: userIdToDelete, farmId });

  return { message: 'User deleted from DB and unassigned from all batches', deletedUserId: userIdToDelete };
};

export const UserServices = {
  getUsersByFarm,
  createUser,
  updateOwnProfile,
  changeOwnPassword,
  toggleUserActive,
  updateUserRole,
  updateUser,
  deleteUser,
};
