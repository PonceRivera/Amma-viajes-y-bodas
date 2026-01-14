import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
    packageName: string;
    packagePrice: string;
    customerName: string;
    customerEmail: string;
    cardLast4: string; // Store only last 4 digits for security simulation
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: Date;
}

const ReservationSchema: Schema = new Schema({
    packageName: { type: String, required: true },
    packagePrice: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    cardLast4: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models['Reservation'] || mongoose.model<IReservation>('Reservation', ReservationSchema);
