import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken } from '../../utils/verifyJWT';
import { User } from '../User/user.model';
import { Farm } from '../Farm/farm.model';
import {
  IRegisterUserPayload,
  IRegisterFarmPayload,
  ILoginPayload,
  ISwitchFarmPayload,
} from './auth.interface';

const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, password, email, phone } = payload;

  const trimmedEmail = email && email.trim() ? email.toLowerCase().trim() : undefined;
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
    name,
    email: trimmedEmail,
    phone: trimmedPhone,
    passwordHash,
    role: 'owner',
    isActive: true,
  });

  await user.save();

  const token = createToken(
    {
      userId: (user._id as any).toString(),
      farmId: '',
      role: user.role,
      email: user.email || '',
      name: user.name,
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    user: {
      userId: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      farmId: null,
      farmName: null,
    },
    accessToken: token,
  };
};

const registerFarm = async (payload: IRegisterFarmPayload) => {
  const { farmName, animalType, date, location, ownerName, email, phone, password, timezone } = payload;

  const trimmedEmail = email && email.trim() ? email.toLowerCase().trim() : undefined;
  const trimmedPhone = phone && phone.trim() ? phone.trim() : undefined;

  if (trimmedEmail) {
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'An account with this email already exists');
    }
  }

  if (trimmedPhone) {
    const existingPhone = await User.findOne({ phone: trimmedPhone });
    if (existingPhone) {
      throw new AppError(httpStatus.BAD_REQUEST, 'An account with this phone number already exists');
    }
  }

  const passwordHash = await bcrypt.hash(password, config.bcrypt_salt_rounds);

  const owner = new User({
    name: ownerName,
    email: trimmedEmail,
    phone: trimmedPhone,
    passwordHash,
    role: 'owner',
    isActive: true,
  });
  await owner.save();

  const farm = new Farm({
    name: farmName,
    animalType: animalType || 'layer',
    date: date ? new Date(date) : undefined,
    location,
    ownerId: owner._id,
    timezone: timezone || 'Asia/Dhaka',
    plan: 'pro',
  });
  await farm.save();

  owner.farmId = farm._id as any;
  owner.activeFarmId = farm._id as any;
  await owner.save();

  const token = createToken(
    {
      userId: (owner._id as any).toString(),
      farmId: (farm._id as any).toString(),
      role: 'owner',
      email: owner.email || '',
      name: owner.name,
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    user: {
      userId: (owner._id as any).toString(),
      farmId: (farm._id as any).toString(),
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      role: owner.role,
      farmName: farm.name,
      animalType: farm.animalType,
    },
    accessToken: token,
  };
};

const loginUser = async (payload: ILoginPayload) => {
  const { identifier, email, phone, password } = payload;
  const loginTerm = (identifier || email || phone || '').trim();

  if (!loginTerm) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please provide an email address or phone number');
  }

  const user = await User.findOne({
    $or: [
      { email: loginTerm.toLowerCase() },
      { phone: loginTerm }
    ]
  }).populate('activeFarmId farmId');

  if (!user || !user.isActive) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid login credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid login credentials');
  }

  let activeFarm = (user.activeFarmId || user.farmId) as any;
  if (!activeFarm) {
    activeFarm = await Farm.findOne({ ownerId: user._id });
    if (activeFarm) {
      user.activeFarmId = activeFarm._id;
      await user.save();
    }
  }

  const farmIdStr = activeFarm ? activeFarm._id.toString() : '';

  const token = createToken(
    {
      userId: (user._id as any).toString(),
      farmId: farmIdStr,
      role: user.role,
      email: user.email || '',
      name: user.name,
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    user: {
      userId: (user._id as any).toString(),
      farmId: farmIdStr,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      farmName: activeFarm?.name || null,
      animalType: activeFarm?.animalType || null,
    },
    accessToken: token,
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).populate('activeFarmId farmId');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User profile not found');
  }

  let activeFarm = (user.activeFarmId || user.farmId) as any;
  if (!activeFarm) {
    activeFarm = await Farm.findOne({ ownerId: user._id });
  }

  const farmIdStr = activeFarm ? activeFarm._id.toString() : '';

  return {
    user: {
      userId: (user._id as any).toString(),
      farmId: farmIdStr,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      farmName: activeFarm?.name || null,
      animalType: activeFarm?.animalType || null,
    },
  };
};

const switchFirm = async (userId: string, payload: ISwitchFarmPayload) => {
  const { farmId } = payload;
  if (!farmId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Firm ID is required');
  }

  const farm = await Farm.findById(farmId);
  if (!farm) {
    throw new AppError(httpStatus.NOT_FOUND, 'Firm not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isOwner = farm.ownerId && farm.ownerId.toString() === (user._id as any).toString();
  const isMember = user.farmId && user.farmId.toString() === farm._id.toString();
  if (!isOwner && !isMember) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to access this firm');
  }

  user.activeFarmId = farm._id as any;
  await user.save();

  const token = createToken(
    {
      userId: (user._id as any).toString(),
      farmId: farm._id.toString(),
      role: user.role,
      email: user.email || '',
      name: user.name,
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    message: `Switched active firm to ${farm.name}`,
    user: {
      userId: (user._id as any).toString(),
      farmId: farm._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      farmName: farm.name,
      animalType: farm.animalType,
    },
    accessToken: token,
  };
};

export const AuthServices = {
  registerUser,
  registerFarm,
  loginUser,
  getMe,
  switchFirm,
};
