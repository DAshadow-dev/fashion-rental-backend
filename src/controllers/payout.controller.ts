import { Request, Response, NextFunction } from "express";
import StorePayout from "../models/payout.model";
import Payment from "../models/payment.model";
import Rental from "../models/rental.model";
import User from "../models/user.model";
import { AuthRequest } from "../types/request.type";

// Admin tạo payout cho store
export const createStorePayout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { storeId, paymentIds, payoutMethod, bankDetails, paypalEmail, notes } = req.body;

        // Kiểm tra store tồn tại
        const store = await User.findById(storeId);
        if (!store || store.role !== "STORE") {
            res.status(404).json({ message: "Store not found" });
            return;
        }

        // Kiểm tra payments tồn tại và thuộc về store này
        const payments = await Payment.find({
            _id: { $in: paymentIds },
            status: "COMPLETED"
        }).populate("rentals");

        if (payments.length === 0) {
            res.status(404).json({ message: "No valid payments found" });
            return;
        }

        // Kiểm tra payments đã được payout chưa
        const existingPayouts = await StorePayout.find({
            paymentIds: { $in: paymentIds }
        });

        if (existingPayouts.length > 0) {
            res.status(400).json({ message: "Some payments have already been processed for payout" });
            return;
        }

        // Verify tất cả payments thuộc về store này và tính tổng từ rental
        let totalStoreAmount = 0;
        const verifiedRentals = [];

        for (const payment of payments) {
            const rentals = await Rental.find({
                _id: { $in: payment.rentals },
                storeId,
                status: "RETURNED" // Chỉ tính các rental đã hoàn thành
            });

            if (rentals.length === 0) {
                res.status(400).json({
                    message: `Payment ${payment._id} does not have valid rentals for this store`
                });
                return;
            }

            verifiedRentals.push(...rentals);
            // Tính tổng từ rental thực tế, không phải từ payment
            totalStoreAmount += rentals.reduce((sum, rental) => sum + rental.totalPrice, 0);
        }

        // Tính toán amount
        const commission = req.body.commission || 10; // Default 10%
        const netAmount = totalStoreAmount * (1 - commission / 100);

        // Tạo payout
        const payout = new StorePayout({
            storeId,
            paymentIds,
            amount: totalStoreAmount,
            commission,
            netAmount,
            payoutMethod,
            bankDetails: payoutMethod === "BANK_TRANSFER" ? bankDetails : undefined,
            paypalEmail: payoutMethod === "PAYPAL" ? paypalEmail : undefined,
            notes
        });

        await payout.save();

        res.status(201).json({
            message: "Store payout created successfully",
            payout: await payout.populate("storeId", "username email storeInfo")
        });
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách payouts (Admin)
export const getAllPayouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, storeId, page = 1, limit = 10 } = req.query;

        const filter: any = {};
        if (status) filter.status = status;
        if (storeId) filter.storeId = storeId;

        const payouts = await StorePayout.find(filter)
            .populate("storeId", "username email storeInfo")
            .populate("paymentIds")
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await StorePayout.countDocuments(filter);

        res.status(200).json({
            payouts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// Lấy payouts của store (Store owner)
export const getStorePayouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const storeId = req.user?._id;
        const { status, page = 1, limit = 10 } = req.query;

        const filter: any = { storeId };
        if (status) filter.status = status;

        const payouts = await StorePayout.find(filter)
            .populate("paymentIds")
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await StorePayout.countDocuments(filter);

        // Tính tổng earnings
        const totalEarnings = await StorePayout.aggregate([
            { $match: { storeId: storeId, status: "COMPLETED" } },
            { $group: { _id: null, total: { $sum: "$netAmount" } } }
        ]);

        const pendingEarnings = await StorePayout.aggregate([
            { $match: { storeId: storeId, status: { $in: ["PENDING", "PROCESSING"] } } },
            { $group: { _id: null, total: { $sum: "$netAmount" } } }
        ]);

        res.status(200).json({
            payouts,
            summary: {
                totalEarnings: totalEarnings[0]?.total || 0,
                pendingEarnings: pendingEarnings[0]?.total || 0
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// Cập nhật trạng thái payout
export const updatePayoutStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { payoutId } = req.params;
        const { status, notes } = req.body;

        const payout = await StorePayout.findById(payoutId);
        if (!payout) {
            res.status(404).json({ message: "Payout not found" });
            return;
        }

        payout.status = status;
        if (notes) payout.notes = notes;
        if (status === "COMPLETED") {
            payout.payoutDate = new Date();
        }

        await payout.save();

        res.status(200).json({
            message: "Payout status updated successfully",
            payout
        });
    } catch (error) {
        next(error);
    }
};

// Lấy thống kê payout cho admin
export const getPayoutStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [totalStats, monthlyStats] = await Promise.all([
            // Tổng thống kê
            StorePayout.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$amount" },
                        totalNetAmount: { $sum: "$netAmount" }
                    }
                }
            ]),
            // Thống kê theo tháng
            StorePayout.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$amount" },
                        totalNetAmount: { $sum: "$netAmount" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);

        res.status(200).json({
            totalStats,
            monthlyStats
        });
    } catch (error) {
        next(error);
    }
};

// Tính toán pending payouts cho các stores
export const calculatePendingPayouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Lấy tất cả payments đã COMPLETED nhưng chưa được payout
        const processedPayoutIds = await StorePayout.distinct("paymentIds");

        const pendingPayments = await Payment.find({
            status: "COMPLETED",
            _id: { $nin: processedPayoutIds }
        }).populate("rentals");

        // Group theo storeId
        const storeEarnings: Record<string, any> = {};

        for (const payment of pendingPayments) {
            const rentals = await Rental.find({
                _id: { $in: payment.rentals },
                status: "RETURNED" // Chỉ tính rental đã hoàn thành
            });

            for (const rental of rentals) {
                const storeId = rental.storeId.toString();

                if (!storeEarnings[storeId]) {
                    const store = await User.findById(storeId).select("username email storeInfo");
                    storeEarnings[storeId] = {
                        storeId,
                        storeInfo: store,
                        payments: [],
                        totalAmount: 0,
                        commission: 10, // Default 10%
                        netAmount: 0,
                        rentalsCount: 0
                    };
                }

                if (!storeEarnings[storeId].payments.includes(payment._id.toString())) {
                    storeEarnings[storeId].payments.push(payment._id);
                }
                storeEarnings[storeId].totalAmount += rental.totalPrice;
                storeEarnings[storeId].rentalsCount += 1;
            }
        }

        // Tính net amount và filter ra những store có earnings
        const validEarnings = Object.values(storeEarnings)
            .filter((earning: any) => earning.totalAmount > 0)
            .map((earning: any) => {
                earning.netAmount = earning.totalAmount * (1 - earning.commission / 100);
                return earning;
            });

        res.status(200).json({
            pendingPayouts: validEarnings
        });
    } catch (error) {
        next(error);
    }
};
