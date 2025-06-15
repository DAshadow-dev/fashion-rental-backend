import { Document } from "mongoose";
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "STORE" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  avatar : string,
  phone: string,
  address: string,
  storeInfo?: {
    storeName: string;
    address: string;
    phone: string;
  };
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  googleId?: string;
}