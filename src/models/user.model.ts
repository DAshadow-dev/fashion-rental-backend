import mongoose, { Mongoose, Schema } from "mongoose";
import { IUser } from "../types/user.type";

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ["CUSTOMER", "STORE", "ADMIN"],
      required: true,
    },
     status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
    storeInfo: {
      storeName: { type: String },
      description: { type: String },
      logoUrl: { type: String },
      featured: { type: Boolean, default: false },
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    googleId: { type: String },
    avatar: { type: String },
    phone: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export type { IUser };

export default User;
