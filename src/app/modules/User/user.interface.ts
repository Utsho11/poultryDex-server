import { Document, Model, Types } from 'mongoose';
import { TUserRole } from './user.constant';

export interface IUser {
  farmId?: Types.ObjectId;
  activeFarmId?: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: TUserRole;
  fcmTokens: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface IUserDoc extends IUser, Document {}

export interface UserModelType extends Model<IUserDoc> {
  isUserExistsByEmail(email: string): Promise<IUserDoc | null>;
  isUserExistsByPhone(phone: string): Promise<IUserDoc | null>;
  isUserExistsByIdentifier(identifier: string): Promise<IUserDoc | null>;
}
