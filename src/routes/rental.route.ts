import { Router } from "express";
import { getRental, updateRental, deleteRental, getAllRentals, createRental } from "../controllers/rental.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RequestHandler } from "express";

const router = Router();

// router.post("/", authMiddleware, createRental);
router.get("/:id", authMiddleware as RequestHandler, getRental);
router.put("/:id", authMiddleware as RequestHandler, updateRental);
router.delete("/:id", authMiddleware as RequestHandler, deleteRental);
router.get("/", authMiddleware as RequestHandler, getAllRentals);

export default router;
