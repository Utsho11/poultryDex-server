import { Schema, model } from 'mongoose';
import { IUserDoc, UserModelType } from './user.interface';

const userSchema = new Schema<IUserDoc, UserModelType>({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
  activeFarmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    set: (v: any) => (v && typeof v === 'string' && v.trim() ? v.trim().toLowerCase() : undefined)
  },
  phone: {
    type: String,
    trim: true,
    set: (v: any) => (v && typeof v === 'string' && v.trim() ? v.trim() : undefined)
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'manager', 'worker'], default: 'owner' },
  fcmTokens: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await this.findOne({ email: email.trim().toLowerCase() });
};

userSchema.statics.isUserExistsByPhone = async function (phone: string) {
  return await this.findOne({ phone: phone.trim() });
};

userSchema.statics.isUserExistsByIdentifier = async function (identifier: string) {
  const trimmed = identifier.trim();
  return await this.findOne({
    $or: [{ email: trimmed.toLowerCase() }, { phone: trimmed }]
  });
};

export const User = model<IUserDoc, UserModelType>('User', userSchema);
export const UserModel = User;
