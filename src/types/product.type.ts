import mongoose,{ Schema } from "mongoose";
import { IProduct } from "../models/product.model";

const ProductSchema = new Schema<IProduct>({
    storeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    description: String,
    category: String,
    size: String,
    rentalPricePerDay: Number,
    depositPrice: Number,
    images: [String],
    available: { type: Boolean, default: true }
  }, { timestamps: true });
  
  export const Product = mongoose.model<IProduct>('Product', ProductSchema);
