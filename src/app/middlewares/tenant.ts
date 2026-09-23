import { Response, NextFunction, Request } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { Farm } from '../modules/Farm/farm.model';

export const resolveTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const headerFarmId = req.headers['x-farm-id'] as string;
    const tokenFarmId = req.user?.farmId;
    const farmId = headerFarmId || tokenFarmId;

    if (!farmId) {
      throw new AppError(httpStatus.FORBIDDEN, 'Firm context missing. Please select or create a Firm.');
    }

    if (headerFarmId) {
      if (!mongoose.Types.ObjectId.isValid(headerFarmId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid firm identifier format');
      }

      if (headerFarmId !== tokenFarmId) {
        if (req.user?.role === 'owner') {
          const userId = req.user.userId || req.user.id;
          const isOwner = await Farm.exists({ _id: headerFarmId, ownerId: userId });
          if (!isOwner) {
            throw new AppError(httpStatus.FORBIDDEN, 'Unauthorized: You do not have permission to access this firm');
          }
        } else {
          throw new AppError(httpStatus.FORBIDDEN, 'Unauthorized: Workers and managers cannot switch firm context');
        }
      }
    }

    req.farmId = farmId;
    next();
  } catch (error) {
    next(error);
  }
};

export default resolveTenant;
