import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  customerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one feedback per customer per store
feedbackSchema.index({ customerId: 1, storeId: 1 }, { unique: true });

export const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);
