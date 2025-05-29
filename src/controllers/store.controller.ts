import { Request, Response } from "express";
import User from "../models/user.model";

export const getAllStores = async (req: Request, res: Response) => {
    try {
        const stores = await User.find({ role: "STORE" });
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
