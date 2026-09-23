/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        userId?: string;
        id?: string;
        farmId?: string;
        role?: 'owner' | 'manager' | 'worker';
        email?: string;
        name?: string;
        [key: string]: any;
      };
      farmId?: string;
    }
  }
}
