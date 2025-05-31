import mongoose, { Document } from "mongoose";
export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  category: string;
  name: string;
  description: string;
  size: string;
  rentalPrice: number; 
  depositPrice: number;
  images: string[]; 
  available: boolean;
}
