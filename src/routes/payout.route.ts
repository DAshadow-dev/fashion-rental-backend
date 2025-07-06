import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createStorePayout,
  getAllPayouts,
  getStorePayouts,
  updatePayoutStatus,
  getPayoutStatistics,
  calculatePendingPayouts
} from "../controllers/payout.controller";

const router = Router();

// Admin routes
router.post("/create", authMiddleware as RequestHandler, createStorePayout);
router.get("/admin/all", authMiddleware as RequestHandler, getAllPayouts);
router.get("/admin/statistics", authMiddleware as RequestHandler, getPayoutStatistics);
router.get("/admin/pending", authMiddleware as RequestHandler, calculatePendingPayouts);
router.put("/:payoutId/status", authMiddleware as RequestHandler, updatePayoutStatus);

// Store owner routes
router.get("/store/my-payouts", authMiddleware as RequestHandler, getStorePayouts);

export default router;
