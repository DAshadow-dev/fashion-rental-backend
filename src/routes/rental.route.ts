import { Router } from "express";
import { getRental, updateRental, deleteRental, getAllRentals, createRental, getUserRentals } from "../controllers/rental.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RequestHandler } from "express";

const router = Router();

router.post("/", authMiddleware as RequestHandler, createRental);
router.get("/:id", authMiddleware as RequestHandler, getRental);
router.put("/:id", authMiddleware as RequestHandler, updateRental);
router.delete("/:rentalId", authMiddleware as RequestHandler, deleteRental);
router.get("/", authMiddleware as RequestHandler, getAllRentals);
router.get("/user/me", authMiddleware as RequestHandler, getUserRentals);

export default router;
