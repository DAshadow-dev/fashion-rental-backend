import mongoose,{ Document } from "mongoose";
export interface IRental extends Document<mongoose.Types.ObjectId> {
  productId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  rentalStart: Date;
  rentalEnd: Date;
  totalPrice: number;
  depositPaid: boolean;
  status: "PENDING" | "APPROVED" | "CANCELED" | "RETURNED";
  paymentUrl?: string; 
  paymentStatus?: "PENDING" | "COMPLETED" | "FAILED"; 
}