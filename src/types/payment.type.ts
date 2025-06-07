import mongoose, { Document } from "mongoose";

export interface IPayment extends Document<mongoose.Types.ObjectId> {
  rentals: mongoose.Types.ObjectId[];
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  orderCode?: number;
}
