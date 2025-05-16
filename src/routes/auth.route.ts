import { RequestHandler, Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import { getCurrentUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

router.post('/register', registerUser as RequestHandler);
router.post('/login', loginUser as RequestHandler);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
