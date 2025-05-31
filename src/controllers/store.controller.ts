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

export const getStoreById = async (req: Request, res: Response): Promise<void> => {
    const storeId = req.params.storeId;
    if (!storeId) {
        res.status(400).json({ message: "Store ID is required" });
        return;
    }
    try {
        const store = await User.findById(storeId);
        if (!store || store.role !== "STORE") {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        res.status(200).json(store);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
