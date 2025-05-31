import mongoose, {Document} from "mongoose";

export interface CartItem extends Document {
    productId: mongoose.Types.ObjectId;
    quantity: number;   
}