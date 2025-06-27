import { Document, Types } from "mongoose";

export interface IReport extends Document {
  reporter: Types.ObjectId;
  target: Types.ObjectId;
  reason: string;
  description?: string;
  createdAt: Date;
}