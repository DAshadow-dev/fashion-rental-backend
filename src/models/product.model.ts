import mongoose from "mongoose";
import { Document } from "mongoose";

export interface IProduct extends Document {
    storeId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    category: string;
    size: string;
    rentalPricePerDay: number;
    depositPrice: number;
    images: string[];
    available: boolean;
  }