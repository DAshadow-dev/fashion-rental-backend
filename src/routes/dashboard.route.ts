import express from "express";
import {
    getDashboardOverview,
    getMonthlyRevenue,
    getTopRentedProducts,
    getRentalStatusStats,
    getUserGrowthStats,
    getRevenueByCategoryStats,
} from "../controllers/dashboard.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

// GET /api/dashboard/overview - Thống kê tổng quan
router.get("/overview", getDashboardOverview);

// GET /api/dashboard/revenue/monthly - Doanh thu theo tháng
router.get("/revenue/monthly", getMonthlyRevenue);

// GET /api/dashboard/products/top-rented - Top products được thuê nhiều nhất
router.get("/products/top-rented", getTopRentedProducts);

// GET /api/dashboard/rentals/status - Thống kê status của rentals
router.get("/rentals/status", getRentalStatusStats);

// GET /api/dashboard/users/growth - Thống kê tăng trưởng user
router.get("/users/growth", getUserGrowthStats);

// GET /api/dashboard/revenue/category - Thống kê doanh thu theo category
router.get("/revenue/category", getRevenueByCategoryStats);

export default router;
