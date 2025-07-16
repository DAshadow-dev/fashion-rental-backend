import { Router } from "express";
import { 
  getRental, 
  updateRental, 
  deleteRental, 
  getAllRentals, 
  createRental, 
  getUserRentals, 
  getRentalsByStoreId, 
  updateRentalStatus,
  cancelRental,
  getUserRentalsWithStatus,
  triggerAutoReturn
} from "../controllers/rental.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RequestHandler } from "express";

const router = Router();

router.post("/", authMiddleware as RequestHandler, createRental);
router.get("/:id", authMiddleware as RequestHandler, getRental);
router.put("/:id", authMiddleware as RequestHandler, updateRental);
router.delete("/:rentalId", authMiddleware as RequestHandler, deleteRental);
router.get("/", authMiddleware as RequestHandler, getAllRentals);

// User rental routes
router.get("/user/me", authMiddleware as RequestHandler, getUserRentalsWithStatus);
router.get("/user/legacy", authMiddleware as RequestHandler, getUserRentals); // Keep old endpoint for compatibility

// Store rental routes
router.get("/store/:storeId", authMiddleware as RequestHandler, getRentalsByStoreId);

// Rental actions
router.patch("/:rentalId/status", authMiddleware as RequestHandler, updateRentalStatus);
router.patch("/:rentalId/cancel", authMiddleware as RequestHandler, cancelRental);

// Admin/testing routes
router.post("/admin/trigger-auto-return", authMiddleware as RequestHandler, triggerAutoReturn);

export default router;
