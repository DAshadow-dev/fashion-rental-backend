import { Document } from "mongoose";
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "STORE" | "ADMIN";
  avatar : string,
  phone: string,
  address: string,
  storeInfo?: {
    storeName: string;
    address: string;
    phone: string;
  };
}