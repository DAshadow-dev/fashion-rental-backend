import { Router } from "express";
import { changePassword, getCurrentUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

router.get('/me', authMiddleware, getCurrentUser);
router.put('/change-password', authMiddleware, changePassword);

export default router;
