import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
    validateCreatePayout,
    validateUpdatePayoutStatus,
    validateQueryParams
} from "../middlewares/payoutValidation.middleware";
import {
    createStorePayout,
    getAllPayouts,
    getStorePayouts,
    updatePayoutStatus,
    getPayoutStatistics,
    calculatePendingPayouts
} from "../controllers/payout.controller";

const router = Router();

// Middleware để check admin role
const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

// Middleware để check store role
const requireStore = (req: any, res: any, next: any) => {
    if (req.user?.role !== "STORE") {
        return res.status(403).json({ message: "Store access required" });
    }
    next();
};

// Admin routes
router.post("/create",
    authMiddleware as RequestHandler,
    requireAdmin,
    validateCreatePayout,
    createStorePayout
);
router.get("/admin/all",
    authMiddleware as RequestHandler,
    requireAdmin,
    validateQueryParams,
    getAllPayouts
);
router.get("/admin/statistics",
    authMiddleware as RequestHandler,
    requireAdmin,
    getPayoutStatistics
);
router.get("/admin/pending",
    authMiddleware as RequestHandler,
    requireAdmin,
    calculatePendingPayouts
);
router.put("/:payoutId/status",
    authMiddleware as RequestHandler,
    requireAdmin,
    validateUpdatePayoutStatus,
    updatePayoutStatus
);

// Store owner routes
router.get("/store/my-payouts",
    authMiddleware as RequestHandler,
    requireStore,
    validateQueryParams,
    getStorePayouts
);

export default router;
