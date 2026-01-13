import mongoose from 'mongoose';

export interface IReceiptItem {
  description: string;
  quantity: number;
  price: number;
}

export interface IReceipt extends mongoose.Document {
  client: mongoose.Types.ObjectId;
  items: IReceiptItem[];
  total: number;
  status: string;
  createdAt: Date;
}

const ReceiptSchema = new mongoose.Schema<IReceipt>(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        description: String,
        quantity: Number,
        price: Number,
      },
    ],
    total: { type: Number, default: 0 },
    status: { type: String, default: 'draft' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

export default mongoose.models['Receipt'] || mongoose.model<IReceipt>('Receipt', ReceiptSchema);
