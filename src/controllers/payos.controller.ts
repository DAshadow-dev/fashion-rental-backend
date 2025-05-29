import { Request, Response } from "express";
import Rental from "../models/rental.model";

export const payosWebhook = async (req: Request, res: Response) => {
  const { orderId, status } = req.body;
  if (status === "PAID") {
    await Rental.findByIdAndUpdate(orderId, { paymentStatus: "COMPLETED" });
  }
  res.status(200).send("OK");
};