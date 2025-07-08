import { RequestHandler, Router } from "express";
import {
  createPaymentCheckout,
  updatePaymentStatus,
  deletePaymentByOrderCode,
  getPaymentsByCustomerId,
  getPaymentSummary,
} from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
// Thanh toán
router.post(
  "/checkout",
  authMiddleware as RequestHandler,
  createPaymentCheckout
);
// Đổi trạng thái thanh toán
router.put(
  "/:paymentId/status",
  authMiddleware as RequestHandler,
  updatePaymentStatus
);
// Xoá thanh toán bằng order code
router.delete(
  "/by-order-code",
  authMiddleware as RequestHandler,
  deletePaymentByOrderCode
);
// Lấy danh sách thanh toán của khách hàng
router.get(
  "/customer/:customerId",
  authMiddleware as RequestHandler,
  getPaymentsByCustomerId
);

router.get("/summary", getPaymentSummary);

export default router;
