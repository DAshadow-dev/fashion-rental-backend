import mongoose from "mongoose";
import { IProduct } from "../types/product.type";

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    category: String,
    size: String,
    rentalPrice: Number,
    depositPrice: Number,
    images: [String],
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);