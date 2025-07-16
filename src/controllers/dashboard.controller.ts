import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import Product from "../models/product.model";
import Rental from "../models/rental.model";
import Payment from "../models/payment.model";
import Report from "../models/report.model";
import { Feedback } from "../models/feedback.model";

// Thống kê tổng quan cho dashboard admin
export const getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [
            totalUsers,
            totalCustomers,
            totalStores,
            totalProducts,
            totalRentals,
            totalActiveRentals,
            totalCompletedRentals,
            totalRevenue,
            totalReports,
            totalFeedbacks,
            recentActivities
        ] = await Promise.all([
            // Tổng số users
            User.countDocuments(),

            // Tổng số customers
            User.countDocuments({ role: "CUSTOMER" }),

            // Tổng số stores
            User.countDocuments({ role: "STORE" }),

            // Tổng số products
            Product.countDocuments(),

            // Tổng số rentals
            Rental.countDocuments(),

            // Tổng số rentals đang active
            Rental.countDocuments({ status: { $in: ["ONGOING", "PENDING"] } }),

            // Tổng số rentals đã hoàn thành
            Rental.countDocuments({ status: "RETURNED" }),

            // Tổng doanh thu từ payments đã completed
            Payment.aggregate([
                { $match: { status: "COMPLETED" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),

            // Tổng số reports
            Report.countDocuments(),

            // Tổng số feedbacks
            Feedback.countDocuments(),

            // Hoạt động gần đây (10 rentals mới nhất)
            Rental.find()
                .populate("customerId", "username")
                .populate("productId", "title")
                .sort({ createdAt: -1 })
                .limit(10)
                .select("customerId productId status totalCost createdAt")
        ]);

        const revenue = totalRevenue[0]?.total || 0;

        res.status(200).json({
            overview: {
                totalUsers,
                totalCustomers,
                totalStores,
                totalProducts,
                totalRentals,
                totalActiveRentals,
                totalCompletedRentals,
                totalRevenue: revenue,
                totalReports,
                totalFeedbacks
            },
            // recentActivities: recentActivities.map(rental => ({
            //     id: rental._id,
            //     customer: rental.customerId?.username || "Unknown",
            //     product: rental.productId?.title || "Unknown Product",
            //     status: rental.status,
            //     amount: rental.totalCost,
            //     date: rental.createdAt
            // }))
        });
    } catch (error) {
        next(error);
    }
};

// Thống kê doanh thu theo tháng (12 tháng gần nhất)
export const getMonthlyRevenue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    status: "COMPLETED",
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Tạo array 12 tháng với giá trị 0 nếu không có data
        const result = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const found = monthlyRevenue.find(item =>
                item._id.year === year && item._id.month === month
            );

            result.push({
                year,
                month,
                monthName: date.toLocaleString('default', { month: 'short' }),
                revenue: found ? found.revenue : 0,
                count: found ? found.count : 0
            });
        }

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Thống kê top products được thuê nhiều nhất
export const getTopRentedProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Starting getTopRentedProducts...');

        const topProducts = await Rental.aggregate([
            {
                $match: {
                    status: { $in: ["RETURNED", "APPROVED"] }
                }
            },
            {
                $group: {
                    _id: "$productId",
                    totalRentals: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    productId: "$_id",
                    title: "$product.name",
                    imageUrl: { $arrayElemAt: ["$product.images", 0] },
                    totalRentals: 1,
                    totalRevenue: 1
                }
            },
            {
                $sort: { totalRentals: -1 }
            },
            {
                $limit: 10
            }
        ]);

        console.log('Top products result:', topProducts);
        res.status(200).json(topProducts);
    } catch (error) {
        console.error('Error in getTopRentedProducts:', error);
        next(error);
    }
};

// Thống kê theo status của rentals
export const getRentalStatusStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statusStats = await Rental.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalValue: { $sum: "$totalCost" }
                }
            }
        ]);

        res.status(200).json(statusStats);
    } catch (error) {
        next(error);
    }
};

// Thống kê doanh thu theo category
export const getRevenueByCategoryStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Starting getRevenueByCategoryStats...');

        const categoryStats = await Rental.aggregate([
            {
                $match: {
                    status: { $in: ["RETURNED", "APPROVED"] }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: "$product.category",
                    totalRentals: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: "$totalRevenue",
                    totalRentals: 1,
                    _id: 0
                }
            },
            {
                $sort: { value: -1 }
            }
        ]);

        console.log('Category stats result:', categoryStats);
        res.status(200).json(categoryStats);
    } catch (error) {
        console.error('Error in getRevenueByCategoryStats:', error);
        next(error);
    }
};

// Thống kê user growth theo tháng
export const getUserGrowthStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        role: "$role"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        res.status(200).json(userGrowth);
    } catch (error) {
        next(error);
    }
};
