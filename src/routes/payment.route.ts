import { RequestHandler, Router } from "express";
import {
  createPaymentCheckout,
  updatePaymentStatus,
  deletePaymentByOrderCode,
} from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/checkout",
  authMiddleware as RequestHandler,
  createPaymentCheckout
);
router.put(
  "/:paymentId/status",
  authMiddleware as RequestHandler,
  updatePaymentStatus
);
router.delete(
  "/by-order-code",
  authMiddleware as RequestHandler,
  deletePaymentByOrderCode
);

export default router;
