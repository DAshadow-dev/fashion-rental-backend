import mongoose from "mongoose";
import { IPayment } from "../types/payment.type";

const PaymentSchema = new mongoose.Schema<IPayment>({
    rentals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rental" }],
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    paymentUrl: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    orderCode: { type: Number, required: true, unique: true },
}, { timestamps: true });
const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;