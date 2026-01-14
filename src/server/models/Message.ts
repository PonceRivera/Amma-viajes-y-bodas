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
/*
print('cjwpa+krfjfañlda')
mientras eso pase tal cosa pasara true 
mientras eso no pase tal cosa pasara false
un int es un tipo de dato (numerico) que solo puede ser entero
un double es un tipo de dato (numerico) que solo puede ser decimal
un string es un tipo de dato (texto) que solo puede ser texto
un boolean es un tipo de dato (booleano) que solo puede ser 0 1 o true false

*/