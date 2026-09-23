import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { User } from '../modules/User/user.model';

export const verifyPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const password =
      req.body?.password || (req.headers['x-password'] as string);

    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Account password is required for security verification'
      );
    }

    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'User session invalid');
    }

    const user = await User.findById(userId);
    if (!user || !user.passwordHash) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'User account not found');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Incorrect password! Security check failed.'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default verifyPassword;
