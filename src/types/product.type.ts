import mongoose, { Document } from "mongoose";
export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  size: string;
  rentalPrice: number; 
  depositPrice: number;
  images: string[]; 
  available: boolean;
}
