import mongoose,{ Schema } from "mongoose";
import { IRental } from "../types/rental.type";

const RentalSchema = new mongoose.Schema<IRental>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rentalStart: Date,
    rentalEnd: Date,
    totalPrice: Number,
    depositPaid: Boolean,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "CANCELED", "RETURNED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const Rental = mongoose.model<IRental>('Rental', RentalSchema);



