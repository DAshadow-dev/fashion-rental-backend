import { RequestHandler, Router } from "express";
import { banUser, changeAvatar, changeInfo, changePassword, getAllUsers, getCurrentUser, unbanUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../config/cloudinary";
const router = Router();

router.get('/me', authMiddleware as RequestHandler, getCurrentUser);
router.put('/change-password', authMiddleware as RequestHandler , changePassword);
router.put('/change-info', authMiddleware as RequestHandler, changeInfo);
router.put('/change-avatar', authMiddleware as RequestHandler, upload.single('avatar'), changeAvatar);

router.get("/customers", authMiddleware as RequestHandler, getAllUsers);

router.patch("/ban/:userId", authMiddleware as RequestHandler, banUser);
router.patch("/unban/:userId", authMiddleware as RequestHandler, unbanUser);

export default router;
