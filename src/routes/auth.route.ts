import { RequestHandler, Router } from "express";
import { registerUser, loginUser, refreshToken, logoutUser } from "../controllers/auth.controller";
import { getCurrentUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware as RequestHandler, getCurrentUser);

export default router;
