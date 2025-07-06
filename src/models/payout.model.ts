import mongoose from "mongoose";
import { IStorePayout } from "../types/payout.type";

const StorePayoutSchema = new mongoose.Schema<IStorePayout>({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paymentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true }],
  amount: { type: Number, required: true },
  commission: { type: Number, required: true, default: 10 }, // 10% commission
  netAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  payoutDate: { type: Date },
  payoutMethod: { 
    type: String, 
    enum: ['BANK_TRANSFER', 'PAYPAL', 'WALLET'], 
    required: true 
  },
  bankDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountName: { type: String },
    swiftCode: { type: String }
  },
  paypalEmail: { type: String },
  notes: { type: String },
}, { timestamps: true });

// Index để tối ưu query
StorePayoutSchema.index({ storeId: 1, status: 1 });
StorePayoutSchema.index({ createdAt: -1 });

const StorePayout = mongoose.model<IStorePayout>("StorePayout", StorePayoutSchema);
export default StorePayout;
