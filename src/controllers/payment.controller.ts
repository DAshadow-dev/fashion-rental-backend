import { Request, Response } from "express";
import Payment from "../models/payment.model";
import Rental from "../models/rental.model";
import { createPayOSPayment } from "../services/payment.service";

export const createPaymentCheckout = async (req: Request, res: Response) => {
  try {
    const { rentalIds } = req.body;

    if (!Array.isArray(rentalIds) || rentalIds.length === 0) {
      res.status(400).json({ message: "Missing rentalIds[]" });
      return;
    }

    const rentals = await Rental.find({ _id: { $in: rentalIds } });
    if (rentals.length === 0) {
      res.status(404).json({ message: "No rentals found" });
      return;
    }

    const totalAmount = rentals.reduce(
      (sum, rental) => sum + rental.totalPrice,
      0
    );

    const orderCode = Math.floor(100000000 + Math.random() * 900000000); // 9 chữ số
    const payment = await Payment.create({
      rentals: rentalIds,
      amount: totalAmount,
      status: "PENDING",
      orderCode,
    });
    console.log(
      "Created Payment:",
      payment._id.toString(),
      "orderCode:",
      orderCode
    );
    const paymentUrl = await createPayOSPayment(
      totalAmount,
      orderCode // truyền số này
    );
    payment.paymentUrl = paymentUrl;
    console.log("Payment URL:", paymentUrl);
    await payment.save();

    res.status(201).json({ paymentUrl });
  } catch (error) {
    console.error("Payment Checkout Error:", error);
    res.status(500).json({ message: "Checkout failed", error });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status, orderCode } = req.body;
    console.log("Update Payment Status:", status, orderCode);
    console.log("Payment ID:", paymentId);
    let payment = null;
    if (orderCode) {
      payment = await Payment.findOne({ orderCode });
    } else if (paymentId) {
      payment = await Payment.findById(paymentId);
    }
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    payment.status = status;
    await payment.save();
    if (status === "COMPLETED") {
      await Rental.updateMany(
        { _id: { $in: payment.rentals } },
        { status: "APPROVED", depositPaid: true }
      );
    }
    res.status(200).json({ message: "Payment status updated successfully" });
  } catch (error) {
    console.error("Update Payment Status Error:", error);
    res.status(500).json({ message: "Failed to update payment status", error });
  }
};

export const deletePaymentByOrderCode = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.query;
    if (!orderCode) {
      res.status(400).json({ message: "Missing orderCode" });
      return;
    }
    const payment = await Payment.findOneAndDelete({
      orderCode: Number(orderCode),
    });
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    await Rental.deleteMany({ _id: { $in: payment.rentals } });
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete payment", error });
  }
};
