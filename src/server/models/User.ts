import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  googleId?: string;
  email: string;
  password?: string;
  name?: string;
  role: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    googleId: { type: String, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    name: { type: String },
    role: { type: String, default: 'user' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

export default mongoose.models['User'] || mongoose.model<IUser>('User', UserSchema);
