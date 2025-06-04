import { Request, Response } from "express";
import Rental from "../models/rental.model";
import Payment from "../models/payment.model";

export const payosWebhook = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body; 

    if (status !== "PAID") {
      res.status(200).send("Ignored");
      return;
    }

    const payment = await Payment.findById(orderId);
    if (!payment) {
      res.status(404).send("Payment not found");
      return;
    }

    payment.status = "COMPLETED";
    await payment.save();

    await Rental.updateMany(
      { _id: { $in: payment.rentals } },
      { status: "APPROVED", depositPaid: true }
    );

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Webhook Error");
  }
};