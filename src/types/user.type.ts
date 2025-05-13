import { Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    role: 'CUSTOMER' | 'STORE' | 'ADMIN';
    storeInfo?: {
      storeName: string;
      address: string;
      phone: string;
    };
}