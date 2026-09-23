import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { catchAsync } from '../utils/catchAsync';
import { verifyToken } from '../utils/verifyJWT';
import { User } from '../modules/User/user.model';
import { TUserRole } from '../modules/User/user.constant';

export const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;

    try {
      decoded = verifyToken(token, config.jwt_access_secret as string);
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token payload');
    }

    // Live database check: verify user exists and is active
    const liveUser = await User.findById(userId).select('isActive farmId role email name');
    if (!liveUser || liveUser.isActive === false) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'User account is deactivated or no longer exists');
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Forbidden: requires ${requiredRoles.join(' or ')} role`
      );
    }

    req.user = decoded as any;
    req.farmId = decoded.farmId;

    next();
  });
};

export default auth;
