import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

export default mongoose.models['Message'] || mongoose.model<IMessage>('Message', MessageSchema);
