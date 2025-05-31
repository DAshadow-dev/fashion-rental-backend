import { Request, Response,NextFunction } from "express";
import Rental from "../models/rental.model";
import { AuthRequest } from "../types/request.type";
import Product from "../models/product.model";
import { createPayOSPayment } from "../services/payment.service";

// Tạo đơn thuê mới
export const createRental = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, ...rest } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.available) {
      return res.status(400).json({ message: "Sản phẩm không thích hợp để thuê" });
    }
    // Tạo đơn thuê với trạng thái pending
    const rental = await Rental.create({ productId, status: "PENDING", ...rest });
    // Tạo link thanh toán PayOS
    const paymentUrl = await createPayOSPayment(product.rentalPrice, rental._id.toString());
    rental.paymentUrl = paymentUrl;
    await rental.save();
    // Cập nhật trạng thái sản phẩm
    product.available = false;
    await product.save();
    res.status(201).json({ rental, paymentUrl });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách đơn thuê của người dùng
export const getUserRentals = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const rentals = await Rental.find({ userId }).populate("productId");
  res.status(200).json(rentals);
};

// Cập nhật trạng thái đơn thuê (ví dụ: trả đồ)
export const updateRentalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const rental = await Rental.findByIdAndUpdate(id, { status }, { new: true });
    // Nếu trả đồ, cập nhật lại trạng thái sản phẩm
    if (status === "returned" && rental) {
      await Product.findByIdAndUpdate(rental.productId, { available: true });
    }
    res.status(200).json(rental);
  } catch (error) {
    next(error);
  }
};

export const getRental = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const rental = await Rental.findById(id);
    res.status(200).json(rental);
};

export const updateRental = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const rental = await Rental.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(rental);
};

export const deleteRental = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await Rental.findByIdAndDelete(id);
    res.status(200).json({ message: "Rental deleted successfully" });
};

export const getAllRentals = async (req: AuthRequest, res: Response) => {
    const rentals = await Rental.find();
    res.status(200).json(rentals);
};





