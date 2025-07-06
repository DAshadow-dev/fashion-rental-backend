import mongoose, { Document } from "mongoose";

export interface IStorePayout extends Document<mongoose.Types.ObjectId> {
  storeId: mongoose.Types.ObjectId;
  paymentIds: mongoose.Types.ObjectId[];
  amount: number;
  commission: number; // Phần trăm hoa hồng platform (VD: 10%)
  netAmount: number; // Số tiền thực tế store nhận được (amount - commission)
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  payoutDate?: Date;
  payoutMethod: "BANK_TRANSFER" | "PAYPAL" | "WALLET";
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    swiftCode?: string;
  };
  paypalEmail?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
