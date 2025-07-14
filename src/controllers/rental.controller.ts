import { Request, Response,NextFunction } from "express";
import Rental from "../models/rental.model";
import { AuthRequest } from "../types/request.type";
import Product from "../models/product.model";
import { createPayOSPayment } from "../services/payment.service";
import RentalScheduleService from "../services/rental.service";

// Tạo đơn thuê mới
export const createRental = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, ...rest } = req.body;
    const product = await Product.findById(productId);
    console.log("Product:", product);
    if (!product || !product.available) {
      res.status(400).json({ message: "Sản phẩm không thích hợp để thuê" });
      return;
    }
    // Tạo đơn thuê với trạng thái pending
    const rental = await Rental.create({ productId, status: "PENDING", ...rest });
    await rental.save();
    res.status(201).json({ rental });
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
// export const updateRentalStatus = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const rental = await Rental.findByIdAndUpdate(id, { status }, { new: true });
//     // Nếu trả đồ, cập nhật lại trạng thái sản phẩm
//     if (status === "returned" && rental) {
//       await Product.findByIdAndUpdate(rental.productId, { available: true });
//     }
//     res.status(200).json(rental);
//   } catch (error) {
//     next(error);
//   }
// };

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
    const { rentalId } = req.params;
    await Rental.findByIdAndDelete(rentalId);
    res.status(200).json({ message: "Rental deleted successfully" });
};

export const getAllRentals = async (req: AuthRequest, res: Response) => {
    const rentals = await Rental.find();
    res.status(200).json(rentals);
};

// Get rentals by storeId
export const getRentalsByStoreId = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const rentals = await Rental.find({ storeId }).populate("customerId").populate("productId");
  res.status(200).json(rentals);
};

export const updateRentalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rentalId } = req.params;
    const { status } = req.body;
    
    const rental = await Rental.findById(rentalId).populate("productId");
    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }

    // Nếu cập nhật thành RETURNED, cập nhật sản phẩm về available
    if (status === "RETURNED" && rental.productId) {
      await Product.findByIdAndUpdate(rental.productId._id, { available: true });
    }

    // Nếu cập nhật thành APPROVED, cập nhật sản phẩm thành không available
    if (status === "APPROVED" && rental.productId) {
      await Product.findByIdAndUpdate(rental.productId._id, { available: false });
    }

    const updatedRental = await Rental.findByIdAndUpdate(rentalId, { status }, { new: true });
    res.status(200).json(updatedRental);
  } catch (error) {
    next(error);
  }
};

// Cancel rental với logic kiểm tra thời gian
export const cancelRental = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rentalId } = req.params;
    const userId = req.user._id;

    const rental = await Rental.findById(rentalId).populate("productId");
    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }

    // Kiểm tra quyền ownership (customer hoặc store owner)
    if (rental.customerId.toString() !== userId.toString() && 
        rental.storeId.toString() !== userId.toString()) {
      res.status(403).json({ message: "You don't have permission to cancel this rental" });
      return;
    }

    // Kiểm tra xem có thể cancel không
    const { canCancel, reason } = RentalScheduleService.canCancelRental(rental);
    if (!canCancel) {
      res.status(400).json({ message: reason });
      return;
    }

    // Cancel rental và cập nhật sản phẩm về available nếu cần
    await Rental.findByIdAndUpdate(rentalId, { status: "CANCELED" });
    
    if (rental.status === "APPROVED" && rental.productId) {
      await Product.findByIdAndUpdate(rental.productId._id, { available: true });
    }

    const cancelledRental = await Rental.findById(rentalId);
    res.status(200).json({ 
      message: "Rental cancelled successfully", 
      rental: cancelledRental 
    });
  } catch (error) {
    next(error);
  }
};

// Lấy rentals với filter theo status (cho My Rentals)
export const getUserRentalsWithStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    // Tự động cập nhật expired rentals trước khi lấy dữ liệu
    await RentalScheduleService.autoReturnExpiredRentals();

    let filter: any = { customerId: userId };
    
    if (status) {
      if (status === 'completed') {
        filter.status = 'RETURNED';
      } else if (status === 'active') {
        filter.status = { $in: ['APPROVED'] };
      } else if (status === 'pending') {
        filter.status = 'PENDING';
      } else if (status === 'cancelled') {
        filter.status = 'CANCELED';
      } else {
        filter.status = status;
      }
    }

    const rentals = await Rental.find(filter)
      .populate("productId")
      .populate("storeId", "username email storeInfo")
      .sort({ createdAt: -1 });

    // Thêm thông tin canCancel cho mỗi rental
    const rentalsWithCancelInfo = rentals.map(rental => {
      const { canCancel, reason } = RentalScheduleService.canCancelRental(rental);
      return {
        ...rental.toObject(),
        canCancel,
        cancelReason: reason
      };
    });

    res.status(200).json(rentalsWithCancelInfo);
  } catch (error) {
    next(error);
  }
};

// Manual trigger auto return (for testing/admin use)
export const triggerAutoReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RentalScheduleService.manualTriggerAutoReturn();
    res.status(200).json({
      message: "Auto return process completed",
      result
    });
  } catch (error) {
    next(error);
  }
};




