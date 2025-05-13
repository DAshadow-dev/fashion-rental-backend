import mongoose,{ Mongoose, Schema } from "mongoose";
import { IUser } from "../types/user.type";

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'STORE', 'ADMIN'], required: true },
    storeInfo: {
        storeName: { type: String },
        address: { type: String },
        phone: { type: String },
    },
}, { timestamps: true });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;


