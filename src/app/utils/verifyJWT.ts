/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import AppError from '../errors/AppError';

export type TJwtPayload = {
  userId: string;
  farmId?: string;
  role: 'owner' | 'manager' | 'worker';
  email?: string;
  name?: string;
  phone?: string;
  [key: string]: any;
};

export const createToken = (
  jwtPayload: TJwtPayload,
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  } as SignOptions);
};

export const verifyToken = (
  token: string,
  secret: string
): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error: any) {
    throw new AppError(401, 'Invalid or expired token');
  }
};
