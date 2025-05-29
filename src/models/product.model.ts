import mongoose from "mongoose";
import { IProduct } from "../types/product.type";

const ProductSchema = new mongoose.Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  rentalPrice: { type: Number, required: true },
  depositPrice: { type: Number, required: true },
  images: [{ type: String, required: true }],
  available: { type: Boolean, default: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  size: { type: String, required: true },
}, { timestamps: true });

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
