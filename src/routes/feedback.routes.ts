import express from "express";
import { feedbackController } from "../controllers/feedback.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware as express.RequestHandler);

// Create feedback
router.post("/", feedbackController.createFeedback);

// Get store feedback
router.get("/store/:storeId", feedbackController.getStoreFeedback);

// Update feedback
router.put("/:feedbackId", feedbackController.updateFeedback);

// Delete feedback
router.delete("/:feedbackId", feedbackController.deleteFeedback);

export default router;
